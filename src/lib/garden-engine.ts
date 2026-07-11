// src/lib/garden-engine.ts
import type { PlantStage, PlantFamily, GardenType, Seed, Topic } from '@/types';
import {
  GARDEN_CONFIG,
  DENSITY_SCORE_MAP,
  STRUCTURE_SCORE_MAP,
  STAGE_THRESHOLDS,
  FAMILY_LABELS,
} from './constants';

/**
 * 计算主题密度分（0–100）
 */
export function calcDensityScore(seedCount: number): number {
  if (seedCount <= 0) return 0;
  for (const [max, score] of DENSITY_SCORE_MAP) {
    if (seedCount <= max) return score;
  }
  throw new Error('Unreachable: DENSITY_SCORE_MAP always ends with [Infinity, 100]');
}

/**
 * 计算信息完整度分（0–100）—— 基于种子级字段
 */
export function calcCompletenessScore(
  gardenType: GardenType,
  filledFields: string[]
): number {
  const totalFields = GARDEN_CONFIG[gardenType].fieldCount;
  if (totalFields === 0) return 0;
  return Math.round((filledFields.length / totalFields) * 100);
}

/**
 * 计算主题级信息完整度分（0–100）—— 基于主题级字段
 * 用于衡量「清单生成就绪度」
 */
export function calcTopicCompletenessScore(
  gardenType: GardenType,
  filledTopicFields: string[]
): number {
  const totalFields = GARDEN_CONFIG[gardenType].topicFieldCount;
  if (totalFields === 0) return 0;
  return Math.round((filledTopicFields.length / totalFields) * 100);
}

/**
 * 计算主题结构度分（0–100）
 */
export function calcStructureScore(branchCount: number): number {
  if (branchCount < 0) return 0;
  for (const [max, score] of STRUCTURE_SCORE_MAP) {
    if (branchCount <= max) return score;
  }
  return 100;
}

/**
 * 计算总生长值（0–100）
 * 生长值 = 主题密度分 × 0.35 + 信息完整度分 × 0.35 + 主题结构度分 × 0.30
 */
export function calcGrowthScore(
  densityScore: number,
  completenessScore: number,
  structureScore: number
): number {
  return Math.round(
    densityScore * 0.35 + completenessScore * 0.35 + structureScore * 0.30
  );
}

/**
 * 根据生长值判定阶段
 */
export function getStage(
  growthScore: number,
  canHarvest: boolean
): PlantStage {
  if (growthScore < STAGE_THRESHOLDS.sprout) return 'seed';
  if (growthScore < STAGE_THRESHOLDS.growing) return 'sprout';
  if (growthScore < STAGE_THRESHOLDS.bloom) return 'growing';
  if (canHarvest) return 'bloom';
  return 'growing'; // 生长值够但 canHarvest 不满足 → 仍为生长中
}

/**
 * 判定是否可采摘（canHarvest）
 */
export function checkCanHarvest(
  gardenType: GardenType,
  branches: string[],
  seeds: Seed[]
): boolean {
  switch (gardenType) {
    case 'travel':
      return branches.length >= 3;
    case 'food':
      return seeds.length >= 5 && branches.length >= 1;
    case 'shopping':
      return branches.length >= 1;
    case 'life':
      return branches.length >= 2;
    case 'aesthetic':
      return seeds.length >= 3;
    default:
      return false;
  }
}

/**
 * 聚合主题级关联标签
 *
 * 数据来源（按权重）：
 *   1. 所有 seed.tags 汇总（权重 = 出现次数）
 *   2. seed.extracted_fields 中适合标签化的短字段（权重 = 1）
 *   3. topic.profile_fields 中偏好类字段（权重 = 2）
 *
 * 过滤规则：排除预算/日期/纯数字/URL/OCR 原文等非标签信息
 */
export function computeTopicAggregatedTags(
  seeds: { tags?: string[]; extracted_fields?: Record<string, string> | null }[],
  profileFields: Record<string, string>,
  gardenType: GardenType
): string[] {
  const weights = new Map<string, number>();

  const add = (raw: string, w: number) => {
    const t = raw.trim();
    if (!t) return;
    // 过滤：太长、纯数字、预算、日期、URL
    if (t.length > 15) return;
    if (/^\d+$/.test(t)) return;
    if (/^\d+元|^\d{4}[-/]\d{2}|^\d+年|^\d+月\d*日?$|^\d+天$|^\d+人$|^https?:\/\//.test(t)) return;
    weights.set(t, (weights.get(t) ?? 0) + w);
  };

  // ① seed.tags —— 出现次数即权重
  for (const seed of seeds) {
    for (const tag of seed.tags ?? []) {
      add(tag, 1);
    }
  }

  // ② extracted_fields 中适合标签化的键
  const TAG_FIELD_KEYS = ['location', 'area', 'city', 'district', 'category', 'scenario', 'style', 'priceLevel', 'cuisine', 'brand'];
  for (const seed of seeds) {
    const ef = (seed.extracted_fields ?? {}) as Record<string, string>;
    for (const key of TAG_FIELD_KEYS) {
      const val = ef[key]?.trim();
      if (val && val.length <= 10) add(val, 1);
    }
  }

  // ③ profile_fields 中偏好类字段（拆分逗号/顿号，权重更高）
  const PROFILE_TAG_KEYS: Record<GardenType, string[]> = {
    travel: ['偏好区域'],
    food: ['城市', '偏好菜系'],
    shopping: ['偏好风格', '品牌偏好'],
    life: ['城市'],
    aesthetic: ['风格偏好', '颜色偏好'],
  };
  for (const key of PROFILE_TAG_KEYS[gardenType] ?? []) {
    const val = profileFields[key]?.trim();
    if (!val) continue;
    for (const part of val.split(/[,，、/]/)) {
      const t = part.trim();
      if (t) add(t, 2);
    }
  }

  // 按权重降序排列
  return [...weights.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}
export function detectMissingFields(
  gardenType: GardenType,
  existingFields: string[]
): string[] {
  const config = GARDEN_CONFIG[gardenType];
  return config.fields.filter((f) => !existingFields.includes(f));
}

/**
 * 检测主题级缺失信息字段
 * 用于「待补充」卡片 —— 衡量生成高质量清单还缺哪些关键信息
 */
export function detectTopicMissingFields(
  gardenType: GardenType,
  filledTopicFields: string[]
): string[] {
  const config = GARDEN_CONFIG[gardenType];
  return config.topicFields.filter((f) => !filledTopicFields.includes(f));
}

/**
 * 根据种子内容的键提取已识别的字段
 */
export function extractFilledFields(
  gardenType: GardenType,
  content: Record<string, string>
): string[] {
  const config = GARDEN_CONFIG[gardenType];
  return config.fields.filter((field) => {
    const value = content[field];
    return value && value.trim().length > 0;
  });
}

/**
 * 完整生长计算（便捷函数）
 */
export function recalcTopic(
  gardenType: GardenType,
  seedCount: number,
  filledFields: string[],
  branchCount: number,
  branches: string[],
  seeds: Seed[]
): {
  growth_score: number;
  density_score: number;
  completeness_score: number;
  structure_score: number;
  stage: PlantStage;
  can_harvest: boolean;
  missing_fields: string[];
} {
  const density = calcDensityScore(seedCount);
  const completeness = calcCompletenessScore(gardenType, filledFields);
  const structure = calcStructureScore(branchCount);
  const growth = calcGrowthScore(density, completeness, structure);
  const canHarvest = checkCanHarvest(gardenType, branches, seeds);
  const stage = getStage(growth, canHarvest);
  const missing = detectMissingFields(gardenType, filledFields);

  return {
    growth_score: growth,
    density_score: density,
    completeness_score: completeness,
    structure_score: structure,
    stage,
    can_harvest: canHarvest,
    missing_fields: missing,
  };
}

/**
 * 根据生长变化生成叙事反馈文案
 */
export function generateGrowthNarrative(
  topicName: string,
  previousScore: number,
  newScore: number,
  addedBranch?: string,
  plantFamily?: PlantFamily
): string {
  const diff = newScore - previousScore;
  const familyLabel = plantFamily ? FAMILY_LABELS[plantFamily] : '植物';

  if (diff <= 0) {
    return `「${topicName}」${familyLabel}正在静静吸收养分`;
  }

  const parts: string[] = [];
  parts.push(`+${diff} 成长值`);

  if (addedBranch) {
    parts.push(`长出了一片「${addedBranch}」新叶`);
  }

  if (newScore >= 75 && previousScore < 75) {
    return `🎉 「${topicName}」${familyLabel}开花了！${parts.join('，')}`;
  }

  if (newScore >= 45 && previousScore < 45) {
    return `🌿 「${topicName}」${familyLabel}进入快速生长期！${parts.join('，')}`;
  }

  if (addedBranch) {
    return `这条灵感让「${topicName}」${familyLabel}长出了一片「${addedBranch}」新叶🍃`;
  }

  return `「${topicName}」${familyLabel}又长大了一点，${parts.join('，')}`;
}
