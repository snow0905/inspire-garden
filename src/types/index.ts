// src/types/index.ts

export type GardenType = 'travel' | 'food' | 'shopping' | 'life' | 'aesthetic';
export type ClassifyResult = GardenType | 'uncategorized';  // AI 分类可能无法归入现有 5 个
export type SourceType = 'image' | 'link' | 'text' | 'wechat';
export type PlantStage = 'seed' | 'sprout' | 'growing' | 'bloom' | 'fruit';
export type Emotion = 'joy' | 'sad' | 'calm' | 'anxious' | 'excited' | 'neutral';
export type AiActivity = 'passive' | 'semi' | 'active';
export type PlantFamily = 'tree' | 'flower' | 'fruitTree' | 'herb' | 'vine';
export type HarvestOutputType = 'itinerary' | 'comparison' | 'checklist' | 'moodboard';

export interface HarvestItem {
  title: string;
  summary: string;
  reason: string;
  tags: string[];
  sourceSeedIds: string[];
  hasUncertainInfo: boolean;
  uncertainNote?: string;
}

export interface HarvestSection {
  name: string;
  sourceCount: number;
  items: HarvestItem[];
}

export interface Harvest {
  id: string;
  user_id: string;
  topic_id: string;
  version: number;
  output_type: HarvestOutputType;
  title: string;
  subtitle: string;
  base_info: Record<string, string>;
  sections: HarvestSection[];
  created_at: string;
  updated_at: string;
}

export interface HarvestPreview {
  title: string;
  subtitle: string;
  outputType: HarvestOutputType;
  baseInfo: Record<string, string>;
  sections: HarvestSection[];
  /** API 层保证准确的种子数（非 AI 估算） */
  seedCount: number;
}

export interface Profile {
  id: string;
  nickname: string;
  garden_name: string;
  ai_activity: AiActivity;
  avatar_url?: string;
}

export interface Topic {
  id: string;
  user_id: string;
  garden_type: GardenType;
  topic_name: string;
  plant_family: PlantFamily;
  stage: PlantStage;
  growth_score: number;
  density_score: number;
  completeness_score: number;
  structure_score: number;
  can_harvest: boolean;
  tags: string[];
  /** 主题级缺失字段 —— 清单生成所需的关键信息 */
  missing_fields: string[];
  /** 主题级已填字段 —— 用户主动补充的清单关键信息 */
  profile_fields?: Record<string, string>;
  color_variant: string;
  fruited_at?: string;
  fruited_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Seed {
  id: string;
  user_id: string;
  topic_id?: string;
  garden_type: GardenType;
  source_type: SourceType;
  content: Record<string, string>;
  source_url?: string;
  tags: string[];
  created_at: string;
  image_url?: string;
  title?: string;
  summary?: string;
  extracted_fields?: Record<string, string>;
  missing_fields?: string[];
  branch?: string;
  user_notes?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: Emotion;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface EmotionLog {
  id: string;
  user_id: string;
  emotion: Emotion;
  intensity: number;
  source: 'chat' | 'manual';
  created_at: string;
}

export interface GardenState {
  user_id: string;
  total_seeds: number;
  total_topics: number;
  blooming_count: number;
  fruited_count: number;
  plants: Plant[];
}

export interface Plant {
  id: string;
  type: GardenType;
  name: string;
  stage: PlantStage;
  planted_at: string;
  growth_score: number;
  color_variant: string;
}

export interface HomeSummary {
  user: { name: string; avatarUrl: string };
  greeting: { title: string; recentKeywords: string[] };
  gardens: GardenOverview[];
  actionableTopics: ActionableTopic[];
  wateringSeeds: WateringSeed[];
  recentSeeds: RecentItem[];
  recentBloomingTopics: RecentItem[];
  gardenReview: { label: string; count: number };
  gardenObservation: string;
}

export interface GardenOverview {
  gardenId: GardenType;
  name: string;
  icon: string;
  topicCount: number;
  bloomingCount: number;
  latestAction?: string;
}

export interface ActionableTopic {
  topicId: string;
  topicName: string;
  gardenType: GardenType;
}

export interface WateringSeed {
  topicId: string;
  topicName: string;
  missingFields: string[];
}

export interface RecentItem {
  label: string;
  time: string;
}

export interface TopicCard {
  topicId: string;
  topicName: string;
  gardenName: string;
  plantFamily: PlantFamily;
  stage: PlantStage;
  seedCount: number;
  growthScore: number;
  tags: string[];
  missingFields: string[];
  canHarvest: boolean;
}

export type IntentType = 'collect' | 'question' | 'supplement' | 'chat';

export interface GrowthNarrative {
  previousGrowthScore: number;
  currentGrowthScore: number;
  contributionScore: number;
  addedBranch?: string;
  addedTags: string[];
  stageBefore: PlantStage;
  stageAfter: PlantStage;
  narrativeText: string;
}

export interface PlantPlacement {
  gardenId: string;
  gardenName: string;
  topicId: string;
  topicName: string;
  plantFamily: PlantFamily;
  stage: PlantStage;
}

export interface SeedAnalysisResult {
  aiTitle: string;
  aiSummary: string;
  tags: string[];
  extractedFields: Record<string, string>;
  missingFields: string[];
  branch?: string;
}

export interface GrowthContribution {
  previousGrowthScore: number;
  currentGrowthScore: number;
  contributionScore: number;
  addedBranch?: string;
  addedTags: string[];
  stageBefore: PlantStage;
  stageAfter: PlantStage;
}

export interface BranchInfo {
  name: string;
  count: number;
  icon?: string;
  isCustom?: boolean;
}

// 植物卡片聚合数据（API 返回）
export interface TopicCardData {
  topicId: string;
  topicName: string;
  plantFamily: PlantFamily;
  stage: PlantStage;
  growthScore: number;
  seedCount: number;
  tags: string[];
  latestSeedTitle: string | null;
  hasHarvest: boolean;
  updatedAt: string;
}

export interface GardenCardsResponse {
  gardenType: GardenType;
  topics: TopicCardData[];
}
