// src/lib/garden-engine.ts
import type { PlantStage, GardenType, Seed, Topic } from '@/types';
import {
  GARDEN_CONFIG,
  DENSITY_SCORE_MAP,
  STRUCTURE_SCORE_MAP,
  STAGE_THRESHOLDS,
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
 * 计算信息完整度分（0–100）
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
 * 检测缺失信息字段
 */
export function detectMissingFields(
  gardenType: GardenType,
  existingFields: string[]
): string[] {
  const config = GARDEN_CONFIG[gardenType];
  return config.fields.filter((f) => !existingFields.includes(f));
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
