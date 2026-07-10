// src/lib/constants.ts
import type { GardenType, PlantStage, PlantFamily } from '@/types';

export const GARDEN_CONFIG: Record<GardenType, {
  name: string;
  icon: string;
  plantFamily: 'tree' | 'flower' | 'fruitTree' | 'herb' | 'vine';
  /** 种子级字段：AI 从单条灵感中提取的字段 */
  fields: string[];
  fieldCount: number;
  /** 主题级字段：生成高质量清单所需的关键信息 */
  topicFields: string[];
  topicFieldCount: number;
  structureBranches: string[];
  harvestType: 'itinerary' | 'comparison' | 'checklist' | 'moodboard';
}> = {
  travel: {
    name: '旅行花园',
    icon: '🧳',
    plantFamily: 'tree',
    fields: ['地点', '时间', '预算', '交通', '住宿', '餐厅', '路线', '链接', '备注'],
    fieldCount: 9,
    topicFields: ['预算范围', '计划出行日期', '旅行天数', '同行人数', '偏好区域'],
    topicFieldCount: 5,
    structureBranches: ['吃', '住', '行', '玩', '买', '避坑'],
    harvestType: 'itinerary',
  },
  food: {
    name: '美食花园',
    icon: '🍜',
    plantFamily: 'herb',
    fields: ['城市', '店名', '人均', '菜系', '适合场景', '营业时间', '地址', '链接'],
    fieldCount: 8,
    topicFields: ['城市', '人均预算', '用餐场景', '偏好菜系', '是否需要预约'],
    topicFieldCount: 5,
    structureBranches: ['餐厅', '咖啡', '甜品', '酒吧', '小吃'],
    harvestType: 'comparison',
  },
  shopping: {
    name: '购物种草',
    icon: '🛍️',
    plantFamily: 'flower',
    fields: ['品牌', '品类', '价格', '购买渠道', '适合对象', '风格', '备注'],
    fieldCount: 7,
    topicFields: ['预算范围', '使用场景', '偏好风格', '品牌偏好', '购买渠道'],
    topicFieldCount: 5,
    structureBranches: ['服饰', '美妆', '家居', '数码', '礼物'],
    harvestType: 'comparison',
  },
  life: {
    name: '生活锦囊',
    icon: '💡',
    plantFamily: 'vine',
    fields: ['场景', '步骤', '要点', '避坑', '来源链接'],
    fieldCount: 5,
    topicFields: ['城市', '预算', '关注风险点', '时间节点', '个人备注'],
    topicFieldCount: 5,
    structureBranches: ['步骤', '要点', '避坑', '资源'],
    harvestType: 'checklist',
  },
  aesthetic: {
    name: '审美灵感',
    icon: '🎨',
    plantFamily: 'flower',
    fields: ['图片', '风格标签', '参考来源', '可应用场景'],
    fieldCount: 4,
    topicFields: ['空间类型', '风格偏好', '颜色偏好', '预算范围', '参考图片'],
    topicFieldCount: 5,
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
  sageGreen: '#b5c9b6',
} as const;

// 植物阶段文案映射
export const STAGE_LABELS: Record<PlantStage, string> = {
  seed: '种子',
  sprout: '发芽',
  growing: '生长中',
  bloom: '开花',
  fruit: '结果',
};

export const STAGE_EMOJI: Record<PlantStage, string> = {
  seed: '🌰',
  sprout: '🌱',
  growing: '🌿',
  bloom: '🌸',
  fruit: '🍎',
};

export const STAGE_FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'sprout', label: '发芽中' },
  { value: 'growing', label: '生长中' },
  { value: 'bloom', label: '开花中' },
  { value: 'fruit', label: '已结果' },
] as const;

export const SORT_OPTIONS = [
  { value: 'updated', label: '最近更新' },
  { value: 'growth_desc', label: '成长值高到低' },
  { value: 'growth_asc', label: '成长值低到高' },
] as const;

// plantFamily 中文映射
export const FAMILY_LABELS: Record<PlantFamily, string> = {
  tree: '树',
  flower: '花',
  fruitTree: '果树',
  herb: '香草',
  vine: '藤蔓',
};

// 分支图标映射
export const BRANCH_ICONS: Record<string, string> = {
  '吃': '🍽️',
  '住': '🏠',
  '行': '🚗',
  '玩': '🎮',
  '买': '🛍️',
  '避坑': '⚠️',
  '餐厅': '🍴',
  '咖啡': '☕',
  '甜品': '🍰',
  '酒吧': '🍸',
  '小吃': '🥟',
  '服饰': '👗',
  '美妆': '💄',
  '家居': '🏠',
  '数码': '📱',
  '礼物': '🎁',
  '步骤': '📋',
  '要点': '💡',
  '资源': '📚',
  '色彩': '🎨',
  '构图': '📐',
  '材质': '🧵',
  '氛围': '✨',
};

// 阶段晋升提示文案
export const STAGE_HINTS: Record<PlantStage, string> = {
  seed: '刚种下，需要更多灵感和信息才能发芽',
  sprout: '已经发芽啦，继续补充信息会茁壮成长',
  growing: '正在蓬勃生长，很快就到开花的季节',
  bloom: '已经开花啦，可以采摘为行动清单了！',
  fruit: '已经结果，这条灵感已经转化为真实行动',
};

// 小园丁提示文案（根据阶段动态生成）
export function getGardenerHint(stage: PlantStage, seedCount: number): string {
  if (stage === 'seed' && seedCount === 0) {
    return '刚刚种下，需要更多灵感和信息才能慢慢发芽～';
  }
  if (stage === 'seed') {
    return `已经收集了 ${seedCount} 条灵感，多投喂几条相关内容，这株植物会长得更快哦～`;
  }
  if (stage === 'sprout') {
    return `已经有 ${seedCount} 条灵感在发芽了，继续补充偏好信息，小园丁会在生成清单时参考它们。`;
  }
  if (stage === 'growing') {
    return '植物正在茁壮成长！多投喂几条相关灵感，或补充偏好，这株植物会长得更快哦～';
  }
  if (stage === 'bloom') {
    return '花开了！小园丁已经可以帮你整理行动清单啦～';
  }
  // fruit
  return '果实成熟了，看看你的收获吧～';
}

// 偏好字段浮层标题（每个花圃不同）
export const PREFERENCE_LABELS: Record<string, string> = {
  travel: '计划信息',
  food: '用餐偏好',
  shopping: '选购偏好',
  life: '使用场景',
  aesthetic: '风格偏好',
};

// 偏好字段 placeholder 映射
export const PREFERENCE_PLACEHOLDERS: Record<string, Record<string, string>> = {
  travel: {
    '预算范围': '例如 5000–8000 元',
    '计划出行日期': '例如 7 月中旬',
    '旅行天数': '例如 5–7 天',
    '同行人数': '例如 2 人 / 一个人',
    '偏好区域': '例如 西南 / 海边 / 日韩',
  },
  food: {
    '城市': '例如 贵阳',
    '人均预算': '例如 100–150 元',
    '用餐场景': '例如 一个人吃 / 朋友聚餐 / 约会',
    '偏好菜系': '例如 本地特色 / 酸汤 / 火锅',
    '是否需要预约': '例如 不确定 / 希望少排队',
  },
  shopping: {
    '预算范围': '例如 500–2000 元',
    '使用场景': '例如 日常通勤 / 周末出游',
    '偏好风格': '例如 简约 / 复古 / 日系',
    '品牌偏好': '例如 优衣库 / 无特别偏好',
    '购买渠道': '例如 线上 / 线下试穿',
  },
  life: {
    '城市': '例如 北京',
    '预算': '例如 500 元以内',
    '关注风险点': '例如 合同条款 / 隐形消费',
    '时间节点': '例如 月底前',
    '个人备注': '例如 对猫友好',
  },
  aesthetic: {
    '空间类型': '例如 客厅 / 卧室 / 工作室',
    '风格偏好': '例如 日式 / 北欧 / 极简',
    '颜色偏好': '例如 暖色调 / 莫兰迪色系',
    '预算范围': '例如 1000–3000 元',
    '参考图片': '例如 有存图 / 待拍摄',
  },
};
