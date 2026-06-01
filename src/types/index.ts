// src/types/index.ts

export type GardenType = 'travel' | 'food' | 'shopping' | 'life' | 'aesthetic';
export type ClassifyResult = GardenType | 'uncategorized';  // AI 分类可能无法归入现有 5 个
export type SourceType = 'image' | 'link' | 'text';
export type PlantStage = 'seed' | 'sprout' | 'growing' | 'bloom' | 'fruit';
export type Emotion = 'joy' | 'sad' | 'calm' | 'anxious' | 'excited' | 'neutral';
export type AiActivity = 'passive' | 'semi' | 'active';
export type PlantFamily = 'tree' | 'flower' | 'fruitTree' | 'herb' | 'vine';
export type HarvestOutputType = 'itinerary' | 'comparison' | 'checklist' | 'moodboard';

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
  missing_fields: string[];
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
