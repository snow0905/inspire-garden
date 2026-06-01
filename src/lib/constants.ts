// src/lib/constants.ts
import type { GardenType } from '@/types';

export const GARDEN_CONFIG: Record<GardenType, {
  name: string;
  icon: string;
  plantFamily: 'tree' | 'flower' | 'fruitTree' | 'herb' | 'vine';
  fields: string[];
  fieldCount: number;
  structureBranches: string[];
  harvestType: 'itinerary' | 'comparison' | 'checklist' | 'moodboard';
}> = {
  travel: {
    name: '旅行花园',
    icon: '🧳',
    plantFamily: 'tree',
    fields: ['地点', '时间', '预算', '交通', '住宿', '餐厅', '路线', '链接', '备注'],
    fieldCount: 9,
    structureBranches: ['吃', '住', '行', '玩', '买', '避坑'],
    harvestType: 'itinerary',
  },
  food: {
    name: '美食花园',
    icon: '🍜',
    plantFamily: 'herb',
    fields: ['城市', '店名', '人均', '菜系', '适合场景', '营业时间', '地址', '链接'],
    fieldCount: 8,
    structureBranches: ['餐厅', '咖啡', '甜品', '酒吧', '小吃'],
    harvestType: 'comparison',
  },
  shopping: {
    name: '购物种草',
    icon: '🛍️',
    plantFamily: 'flower',
    fields: ['品牌', '品类', '价格', '购买渠道', '适合对象', '风格', '备注'],
    fieldCount: 7,
    structureBranches: ['服饰', '美妆', '家居', '数码', '礼物'],
    harvestType: 'comparison',
  },
  life: {
    name: '生活锦囊',
    icon: '💡',
    plantFamily: 'vine',
    fields: ['场景', '步骤', '要点', '避坑', '来源链接'],
    fieldCount: 5,
    structureBranches: ['步骤', '要点', '避坑', '资源'],
    harvestType: 'checklist',
  },
  aesthetic: {
    name: '审美灵感',
    icon: '🎨',
    plantFamily: 'flower',
    fields: ['图片', '风格标签', '参考来源', '可应用场景'],
    fieldCount: 4,
    structureBranches: ['色彩', '构图', '材质', '氛围'],
    harvestType: 'moodboard',
  },
};

export const DENSITY_SCORE_MAP: [number, number][] = [
  [1, 20],
  [3, 40],
  [7, 65],
  [15, 85],
  [Infinity, 100],
];

export const STRUCTURE_SCORE_MAP: [number, number][] = [
  [0, 0],
  [1, 30],
  [2, 50],
  [4, 75],
  [5, 100],
];

export const STAGE_THRESHOLDS = {
  sprout: 25,
  growing: 45,
  bloom: 75,
} as const;

export const COLORS = {
  cream: '#faf6f0',
  mistPink: '#f2e4da',
  warmBrown: '#d9b299',
  deepBrown: '#947453',
  gold: '#e5c872',
  darkGold: '#d3a76d',
  coral: '#ed726e',
  textPrimary: '#69562c',
} as const;
