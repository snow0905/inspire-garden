// src/lib/demo-data.ts
// 游客 Demo 模式的完整示例花园数据 —— 模拟一个已使用一段时间的真实用户

import type {
  HomeSummary,
  GardenCardsResponse,
  TopicCardData,
  Topic,
  Seed,
  Harvest,
  HarvestPreview,
  GardenType,
} from '@/types';

// ============================================================
// Demo 用户
// ============================================================
export const DEMO_USER = {
  name: '灵感旅人',
  avatarUrl: '/assets/avatar.png',
};

// ============================================================
// Topic ID 常量
// ============================================================
export const DEMO_TOPIC_IDS: Record<GardenType, string> = {
  travel: 'demo-travel-tokyo',
  food: 'demo-food-brunch',
  shopping: 'demo-shopping-autumn',
  aesthetic: 'demo-aesthetic-office',
  life: 'demo-life-bedroom',
};

// ============================================================
// HomeSummary — 首页聚合数据
// ============================================================
export const demoHomeSummary: HomeSummary = {
  user: { name: DEMO_USER.name, avatarUrl: DEMO_USER.avatarUrl },
  greeting: {
    title: '下午好，今天你的灵感花园又长大了一点。',
    recentKeywords: ['东京', '咖啡', '通勤包', '女生独行'],
  },
  gardens: [
    {
      gardenId: 'travel',
      name: '旅行花园',
      icon: '🧳',
      topicCount: 1,
      bloomingCount: 1,
      latestAction: '东京三日散步清单已开花',
    },
    {
      gardenId: 'food',
      name: '美食花园',
      icon: '🍜',
      topicCount: 1,
      bloomingCount: 0,
      latestAction: '新增 RAC 咖啡灵感',
    },
    {
      gardenId: 'shopping',
      name: '购物种草',
      icon: '🛍️',
      topicCount: 1,
      bloomingCount: 0,
      latestAction: 'Everlane 通勤包灵感已种下',
    },
    {
      gardenId: 'life',
      name: '生活锦囊',
      icon: '💡',
      topicCount: 1,
      bloomingCount: 0,
      latestAction: '整理卧室改造检查表',
    },
    {
      gardenId: 'aesthetic',
      name: '审美灵感',
      icon: '🎨',
      topicCount: 1,
      bloomingCount: 0,
      latestAction: '收藏轻职场穿搭灵感',
    },
  ],
  actionableTopics: [
    { topicId: DEMO_TOPIC_IDS.travel, topicName: '东京周末旅行灵感', gardenType: 'travel' },
  ],
  wateringSeeds: [
    { topicId: DEMO_TOPIC_IDS.shopping, topicName: '秋季通勤好物清单', missingFields: ['预算范围', '购买渠道'] },
    { topicId: DEMO_TOPIC_IDS.life, topicName: '卧室改造灵感', missingFields: ['预算', '时间节点'] },
    { topicId: DEMO_TOPIC_IDS.aesthetic, topicName: '轻职场穿搭灵感', missingFields: ['颜色偏好'] },
  ],
  recentSeeds: [
    { label: '代官山小众美术馆', time: '今天 14:32' },
    { label: '通勤包新配色灵感', time: '昨天 21:18' },
  ],
  recentBloomingTopics: [
    { label: '东京周末旅行灵感', time: '今天 10:15' },
  ],
  gardenReview: { label: '七月灵感回顾', count: 28 },
  gardenObservation: '你最近对「东京旅行」「咖啡馆灵感」「通勤包搭配」很感兴趣，灵感正在悄悄生长。',
};

// ============================================================
// GardenCardsResponse — 每个花圃的卡片列表
// ============================================================

const travelCard: TopicCardData = {
  topicId: DEMO_TOPIC_IDS.travel,
  topicName: '东京周末旅行灵感',
  plantFamily: 'tree',
  stage: 'bloom',
  growthScore: 86,
  seedCount: 28,
  tags: ['东京', '咖啡店', '散步路线', '美术馆', '预算'],
  latestSeedTitle: '中目黑川樱花步道旁的宝藏咖啡店',
  hasHarvest: true,
  updatedAt: '2026-07-10T10:15:00Z',
};

const foodCard: TopicCardData = {
  topicId: DEMO_TOPIC_IDS.food,
  topicName: '上海 brunch 餐厅收藏',
  plantFamily: 'herb',
  stage: 'growing',
  growthScore: 72,
  seedCount: 19,
  tags: ['brunch', '咖啡', '周末', '朋友聚会', '静安'],
  latestSeedTitle: '武康路新开法式面包房 Le Petit',
  hasHarvest: false,
  updatedAt: '2026-07-09T18:30:00Z',
};

const shoppingCard: TopicCardData = {
  topicId: DEMO_TOPIC_IDS.shopping,
  topicName: '秋季通勤好物清单',
  plantFamily: 'flower',
  stage: 'growing',
  growthScore: 64,
  seedCount: 15,
  tags: ['通勤包', '香氛', '收纳', '质感单品', '秋季'],
  latestSeedTitle: 'Everlane 新款通勤包测评截图',
  hasHarvest: false,
  updatedAt: '2026-07-08T21:18:00Z',
};

const lifeCard: TopicCardData = {
  topicId: DEMO_TOPIC_IDS.life,
  topicName: '卧室改造灵感',
  plantFamily: 'vine',
  stage: 'sprout',
  growthScore: 43,
  seedCount: 7,
  tags: ['奶油风', '收纳', '床品', '氛围灯', '香薰'],
  latestSeedTitle: '小红书奶油风卧室收纳动线图',
  hasHarvest: false,
  updatedAt: '2026-07-07T15:00:00Z',
};

const aestheticCard: TopicCardData = {
  topicId: DEMO_TOPIC_IDS.aesthetic,
  topicName: '轻职场穿搭灵感',
  plantFamily: 'flower',
  stage: 'sprout',
  growthScore: 58,
  seedCount: 11,
  tags: ['通勤', '低饱和色', '针织', '半裙', '简约'],
  latestSeedTitle: '韩国博主秋季通勤一周穿搭合集',
  hasHarvest: false,
  updatedAt: '2026-07-06T12:45:00Z',
};

export const demoGardenCards: Record<GardenType, GardenCardsResponse> = {
  travel: { gardenType: 'travel', topics: [travelCard] },
  food: { gardenType: 'food', topics: [foodCard] },
  shopping: { gardenType: 'shopping', topics: [shoppingCard] },
  life: { gardenType: 'life', topics: [lifeCard] },
  aesthetic: { gardenType: 'aesthetic', topics: [aestheticCard] },
};

// ============================================================
// Harvest & HarvestPreview — 预置清单数据
// ============================================================

const travelHarvest: Harvest = {
  id: 'demo-harvest-travel',
  user_id: 'demo-user',
  topic_id: DEMO_TOPIC_IDS.travel,
  version: 1,
  output_type: 'itinerary',
  title: '东京三日散步清单',
  subtitle: '小园丁根据「东京周末旅行灵感」里的 28 条灵感，帮你整理了一份候选清单',
  base_info: {
    '预算范围': '5000–8000 元',
    '出行日期': '9 月中旬',
    '旅行天数': '3 天 2 晚',
  },
  sections: [
    {
      name: 'Day 1：代官山 / 中目黑散步路线',
      sourceCount: 9,
      items: [
        {
          title: '代官山蔦屋书店',
          summary: '被评为世界最美书店之一，设计感极强，适合拍照和淘日本设计杂志',
          reason: '你的灵感收藏中多次提到设计书店',
          tags: ['书店', '设计', '拍照'],
          sourceSeedIds: ['s1', 's2'],
          hasUncertainInfo: false,
        },
        {
          title: '中目黑川樱花步道旁的宝藏咖啡店 Onibus Coffee',
          summary: '二层的木造小楼，阳台可以看电车驶过，拿铁是东京 top 级别',
          reason: '与你的咖啡偏好高度匹配',
          tags: ['咖啡', '中目黑', '阳台'],
          sourceSeedIds: ['s3'],
          hasUncertainInfo: false,
        },
        {
          title: 'Log Road Daikanyama 复合商业街',
          summary: '从铁轨遗址改造的街区，集合买手店 + 精酿啤酒 + 户外草坪',
          reason: '适合傍晚散步和购物',
          tags: ['商业街', '精酿', '户外'],
          sourceSeedIds: ['s4', 's5'],
          hasUncertainInfo: true,
          uncertainNote: '营业时间需确认，部分店铺可能周一休业',
        },
      ],
    },
    {
      name: 'Day 2：美术馆 + 咖啡店',
      sourceCount: 10,
      items: [
        {
          title: '国立新美术馆',
          summary: '黑川纪章设计的波浪形玻璃建筑，定期举办大型特展',
          reason: '你的收藏中多次出现建筑美学相关内容',
          tags: ['美术馆', '建筑', '设计'],
          sourceSeedIds: ['s6'],
          hasUncertainInfo: false,
        },
        {
          title: '六本木之丘展望台 + 森美术馆',
          summary: '可以俯瞰东京塔的夜景，森美术馆策展方向偏当代艺术',
          reason: '夜景 + 艺术的双重体验',
          tags: ['夜景', '美术馆', '东京塔'],
          sourceSeedIds: ['s7', 's8'],
          hasUncertainInfo: false,
        },
        {
          title: 'Blue Bottle 清澄白河店',
          summary: '蓝瓶咖啡在日本的旗舰店，工业风仓库改造，手冲体验极佳',
          reason: '你的咖啡地图收藏中的高频关键词',
          tags: ['咖啡', '手冲', '工业风'],
          sourceSeedIds: ['s9'],
          hasUncertainInfo: false,
        },
      ],
    },
    {
      name: 'Day 3：银座购物 + 伴手礼',
      sourceCount: 7,
      items: [
        {
          title: '银座伊东屋',
          summary: '百年文具店，一整栋楼都是文具，适合买伴手礼和文创',
          reason: '你的收藏中有多条文具相关灵感',
          tags: ['文具', '伴手礼', '银座'],
          sourceSeedIds: ['s10', 's11'],
          hasUncertainInfo: false,
        },
        {
          title: 'Ginza Six 茑屋书店',
          summary: '银座六丁目商场内的艺术书店，选品偏摄影和艺术画册',
          reason: '与你的审美偏好匹配',
          tags: ['书店', '艺术', '银座'],
          sourceSeedIds: ['s12'],
          hasUncertainInfo: true,
          uncertainNote: '楼层和营业时间待确认',
        },
      ],
    },
    {
      name: '预算提醒 & 备选',
      sourceCount: 2,
      items: [
        {
          title: '晴天 / 雨天备选方案',
          summary:
            '晴：代官山–中目黑步行（Day1）+ 美术馆（Day2）；雨：银座室内逛街全改 Day1 + 新宿伊势丹百货替代',
          reason: '你的收藏中有雨天备选的讨论',
          tags: ['备选', '天气'],
          sourceSeedIds: ['s13'],
          hasUncertainInfo: false,
        },
        {
          title: '待确认信息：出行日期、酒店位置、同行人数',
          summary: '清单生成时这 3 项信息尚未补充，可能影响预算和路线安排',
          reason: '小园丁提醒你补充这些关键信息',
          tags: ['待确认'],
          sourceSeedIds: [],
          hasUncertainInfo: true,
          uncertainNote: '建议在出行前 2 周确认以上信息',
        },
      ],
    },
  ],
  created_at: '2026-07-10T10:15:00Z',
  updated_at: '2026-07-10T10:15:00Z',
};

const travelHarvestPreview: HarvestPreview = {
  title: travelHarvest.title,
  subtitle: travelHarvest.subtitle,
  outputType: 'itinerary',
  baseInfo: travelHarvest.base_info,
  sections: travelHarvest.sections,
  seedCount: 28,
};

// 为其他主题准备轻量清单预览（demo 模式下点击生成清单时动态展示）
const foodHarvestPreview: HarvestPreview = {
  title: '上海 brunch 地图',
  subtitle: '小园丁根据「上海 brunch 餐厅收藏」里的 19 条灵感，帮你整理了一份候选清单',
  outputType: 'comparison',
  baseInfo: { '城市': '上海', '人均预算': '100–200 元', '用餐场景': '周末 brunch' },
  sections: [
    {
      name: '静安区 brunch 推荐',
      sourceCount: 8,
      items: [
        {
          title: 'RAC Coffee',
          summary: '法式可丽饼和牛油果吐司是招牌，周末排队约 30 分钟，露台位适合拍照',
          reason: '你的收藏中提及频率最高',
          tags: ['法式', '可丽饼', '露台'],
          sourceSeedIds: ['f1', 'f2'],
          hasUncertainInfo: false,
        },
        {
          title: 'Alimentari Grande',
          summary: '意大利风情杂货铺 + 简餐，火腿拼盘和芝士拼盘性价比极高',
          reason: '与你的朋友聚会场景匹配',
          tags: ['意大利', '火腿', '芝士'],
          sourceSeedIds: ['f3'],
          hasUncertainInfo: false,
        },
        {
          title: 'Oha Eatery',
          summary: '安福路上的贵州风味创意融合菜，环境轻松，菜品惊喜度高',
          reason: '你的小众探店偏好',
          tags: ['贵州菜', '创意', '安福路'],
          sourceSeedIds: ['f4'],
          hasUncertainInfo: true,
          uncertainNote: '需要提前预约，walk-in 成功率较低',
        },
      ],
    },
    {
      name: '徐汇区 brunch 推荐',
      sourceCount: 6,
      items: [
        {
          title: 'Bread etc',
          summary: '武康路附近的面包店，肉桂卷和法式吐司是必点，院子里阳光好',
          reason: '你的面包烘焙偏好',
          tags: ['面包', '法式吐司', '武康路'],
          sourceSeedIds: ['f5'],
          hasUncertainInfo: false,
        },
      ],
    },
    {
      name: '待确认信息',
      sourceCount: 5,
      items: [
        {
          title: '是否需要预约？偏好菜系？',
          summary: '清单生成时这 2 项信息尚未补充，可能影响推荐准确性',
          reason: '小园丁提醒你补充这些关键信息',
          tags: ['待确认'],
          sourceSeedIds: [],
          hasUncertainInfo: true,
          uncertainNote: '建议在出发前补全偏好信息',
        },
      ],
    },
  ],
  seedCount: 19,
};

const shoppingHarvestPreview: HarvestPreview = {
  title: '秋季通勤好物清单',
  subtitle: '小园丁根据「秋季通勤好物清单」里的 15 条灵感，帮你整理了一份候选清单',
  outputType: 'comparison',
  baseInfo: { '使用场景': '日常通勤', '偏好风格': '简约 / 质感', '季节': '秋季' },
  sections: [
    {
      name: '通勤包',
      sourceCount: 5,
      items: [
        {
          title: 'Everlane 通勤托特包',
          summary: '极简设计，容量大能装 13 寸笔记本，皮质柔软，适合日常通勤',
          reason: '你的收藏中最常出现的包款品牌',
          tags: ['托特包', '极简', 'Everlane'],
          sourceSeedIds: ['sh1', 'sh2'],
          hasUncertainInfo: false,
        },
        {
          title: 'A.P.C. 半月包',
          summary: '法国小众品牌，半月造型优雅，可斜挎可手拎，适合轻装通勤',
          reason: '与你的简约风格偏好匹配',
          tags: ['半月包', '法式', '斜挎'],
          sourceSeedIds: ['sh3'],
          hasUncertainInfo: true,
          uncertainNote: '颜色可选较少，需确认是否有秋季新色',
        },
      ],
    },
    {
      name: '香氛 & 收纳',
      sourceCount: 4,
      items: [
        {
          title: 'Muji 桌面收纳组合',
          summary: '简约白色系，模块化设计可自由组合，适合办公桌收纳',
          reason: '你的收纳类灵感中高频出现',
          tags: ['收纳', 'Muji', '桌面'],
          sourceSeedIds: ['sh4'],
          hasUncertainInfo: false,
        },
        {
          title: 'Byredo 护手霜（麂皮调）',
          summary: '木质调的秋冬香氛，质地滋润不油腻，适合办公室随身携带',
          reason: '与你的香氛品类偏好匹配',
          tags: ['香氛', '护手霜', 'Byredo'],
          sourceSeedIds: ['sh5'],
          hasUncertainInfo: true,
          uncertainNote: '价格偏高，需确认预算',
        },
      ],
    },
  ],
  seedCount: 15,
};

const lifeHarvestPreview: HarvestPreview = {
  title: '卧室改造步骤清单',
  subtitle: '小园丁根据「卧室改造灵感」里的 7 条灵感，帮你整理了一份候选清单',
  outputType: 'checklist',
  baseInfo: { '风格': '奶油风', '空间类型': '卧室' },
  sections: [
    {
      name: '改造步骤',
      sourceCount: 5,
      items: [
        { title: '墙面改色：多乐士奶油白乳胶漆', summary: '选择偏暖的奶油白调，避免冷白让空间显得生硬', reason: '你的收藏中多次提到奶油风', tags: ['墙面', '奶油白'], sourceSeedIds: ['l1'], hasUncertainInfo: false },
        { title: '床品更换：亚麻色纯棉四件套', summary: '选择亚麻色或米色系，材质以纯棉/水洗棉为佳', reason: '与你的质感偏好匹配', tags: ['床品', '亚麻色'], sourceSeedIds: ['l2'], hasUncertainInfo: false },
        { title: '灯光改造：色温 3000K 暖光', summary: '床头吊灯 + 落地氛围灯，搭配智能灯泡可调节亮度和色温', reason: '氛围灯是你的高优先级收藏', tags: ['灯光', '氛围灯', '暖光'], sourceSeedIds: ['l3'], hasUncertainInfo: true, uncertainNote: '需确认电路位置是否支持新增吊灯' },
      ],
    },
    {
      name: '待确认信息',
      sourceCount: 2,
      items: [
        { title: '预算范围 & 时间节点', summary: '清单生成时这 2 项信息尚未补充', reason: '小园丁提醒你补充', tags: ['待确认'], sourceSeedIds: [], hasUncertainInfo: true },
      ],
    },
  ],
  seedCount: 7,
};

const aestheticHarvestPreview: HarvestPreview = {
  title: '轻职场穿搭灵感版',
  subtitle: '小园丁根据「轻职场穿搭灵感」里的 11 条灵感，帮你整理了一份候选清单',
  outputType: 'moodboard',
  baseInfo: { '风格偏好': '简约 / 通勤', '季节': '秋季' },
  sections: [
    {
      name: '核心单品组合',
      sourceCount: 6,
      items: [
        { title: '低饱和色针织衫 × 3', summary: '米白、燕麦色、雾霾蓝各一，基础色系之间可以任意组合', reason: '你的收藏中针织衫占比最高', tags: ['针织', '低饱和色', '基础款'], sourceSeedIds: ['a1', 'a2'], hasUncertainInfo: false },
        { title: '垂感半裙 × 2', summary: '深灰百褶半裙 + 卡其色直筒半裙，覆盖正式和休闲场景', reason: '通勤 + 日常的平衡选择', tags: ['半裙', '通勤', '垂感'], sourceSeedIds: ['a3'], hasUncertainInfo: false },
        { title: '简约首饰点缀', summary: '细链条锁骨链 + 小珍珠耳钉，点到为止不过分张扬', reason: '对质感单品的偏好', tags: ['首饰', '简约', '珍珠'], sourceSeedIds: ['a4'], hasUncertainInfo: true, uncertainNote: '珍珠耳钉的品牌和预算需确认' },
      ],
    },
  ],
  seedCount: 11,
};

// ============================================================
// Topic 核心数据（用于主题详情页）
// ============================================================

function makeTopic(
  id: string,
  gardenType: GardenType,
  topicName: string,
  stage: Topic['stage'],
  growthScore: number,
  seedCount: number,
  densityScore: number,
  completenessScore: number,
  structureScore: number,
  canHarvest: boolean,
  tags: string[],
  missingFields: string[],
  profileFields: Record<string, string>,
  plant_family: Topic['plant_family'],
  colorVariant: string,
): Topic {
  return {
    id,
    user_id: 'demo-user',
    garden_type: gardenType,
    topic_name: topicName,
    plant_family,
    stage,
    growth_score: growthScore,
    density_score: densityScore,
    completeness_score: completenessScore,
    structure_score: structureScore,
    can_harvest: canHarvest,
    tags,
    missing_fields: missingFields,
    profile_fields: profileFields,
    color_variant: colorVariant,
    created_at: '2026-06-15T08:00:00Z',
    updated_at: '2026-07-10T10:15:00Z',
  };
}

// ============================================================
// Seeds — 灵感内容
// ============================================================

function makeSeed(
  id: string,
  topicId: string,
  gardenType: GardenType,
  sourceType: Seed['source_type'],
  title: string,
  summary: string,
  tags: string[],
  content: Record<string, string>,
  extra?: Partial<Pick<Seed, 'source_url' | 'image_url' | 'extracted_fields' | 'missing_fields' | 'branch' | 'user_notes'>>,
): Seed {
  return {
    id,
    user_id: 'demo-user',
    topic_id: topicId,
    garden_type: gardenType,
    source_type: sourceType,
    content,
    source_url: extra?.source_url,
    image_url: extra?.image_url,
    title,
    summary,
    tags,
    extracted_fields: extra?.extracted_fields ?? {},
    missing_fields: extra?.missing_fields ?? [],
    branch: extra?.branch,
    user_notes: extra?.user_notes,
    created_at: '2026-07-08T14:00:00Z',
  };
}

// ---- 旅行花园 seeds ----
const travelSeeds: Seed[] = [
  makeSeed('s1', DEMO_TOPIC_IDS.travel, 'travel', 'link', '代官山蔦屋书店攻略', '被评为世界最美书店之一，设计感极强，适合拍照和淘日本设计杂志', ['书店', '设计', '代官山'], { text: 'https://example.com/daikanyama-tsutaya' }, { source_url: 'https://example.com/daikanyama-tsutaya', extracted_fields: { '地点': '代官山', '交通': '东急东横线代官山站步行 5 分钟' }, missing_fields: ['预算', '营业时间'], branch: '玩' }),
  makeSeed('s2', DEMO_TOPIC_IDS.travel, 'travel', 'image', '代官山街景截图', '代官山整体街区氛围 —— 安静、高级、适合漫步，充满设计师店铺和小众咖啡馆', ['代官山', '街区', '氛围'], { ocrText: '代官山 散步路线 推荐' }, { image_url: '/assets/demo/travel-daikanyama.jpg', missing_fields: ['时间'], branch: '玩' }),
  makeSeed('s3', DEMO_TOPIC_IDS.travel, 'travel', 'text', 'Onibus Coffee 中目黑店', '二层的木造小楼，阳台座位正对铁道，手冲咖啡水平极高。拿铁 550 日元，性价比东京 top。适合一个人发呆或和朋友小坐。', ['咖啡', '中目黑', '拿铁'], { text: 'Onibus Coffee 中目黑店体验笔记' }, { extracted_fields: { '店名': 'Onibus Coffee', '地点': '中目黑', '人均': '550 日元' }, missing_fields: ['营业时间'], branch: '吃' }),
  makeSeed('s4', DEMO_TOPIC_IDS.travel, 'travel', 'link', 'Log Road Daikanyama 商业街介绍', '从铁轨遗址改造的街区，集合买手店 + 精酿啤酒 + 户外草坪，逛完可以坐一下午', ['商业街', '精酿', '改造'], { text: 'https://example.com/log-road' }, { source_url: 'https://example.com/log-road', extracted_fields: { '地点': '代官山附近', '类型': '商业街' }, branch: '买' }),
  makeSeed('s5', DEMO_TOPIC_IDS.travel, 'travel', 'text', '东京三日行程初稿', 'Day1 代官山+中目黑，Day2 六本木美术馆区，Day3 银座购物。酒店考虑住新宿或涩谷附近，交通方便。预算控制在 6000 元左右。', ['行程', '三日', '预算'], { text: '东京三日行程草稿' }, { extracted_fields: { '预算': '6000 元', '旅行天数': '3 天' }, missing_fields: ['出行日期', '酒店位置', '同行人数'], branch: '行' }),
];

// ---- 美食花园 seeds ----
const foodSeeds: Seed[] = [
  makeSeed('f1', DEMO_TOPIC_IDS.food, 'food', 'image', 'RAC Coffee 可丽饼照片', '法式可丽饼配焦糖苹果 + 咸黄油焦糖酱，外皮酥脆内馅柔软，摆盘也很美', ['法式', '可丽饼', 'RAC'], { ocrText: 'RAC Coffee 可丽饼 周末 brunch' }, { missing_fields: ['人均', '营业时间'], branch: '餐厅' }),
  makeSeed('f2', DEMO_TOPIC_IDS.food, 'food', 'link', '大众点评 RAC Coffee 合集', '静安区 brunch 排名第一，周末排队约 30 分钟，露台位最抢手。推荐：可丽饼、牛油果吐司、冷萃', ['brunch', '静安', '露台'], { text: 'https://example.com/rac-coffee' }, { source_url: 'https://example.com/rac-coffee', extracted_fields: { '店名': 'RAC Coffee', '城市': '上海', '人均': '120 元' }, branch: '咖啡' }),
  makeSeed('f3', DEMO_TOPIC_IDS.food, 'food', 'text', 'Alimentari Grande 体验笔记', '意大利风情杂货铺+简餐，非常适合朋友聚会。火腿拼盘 98 元，份量足够 2-3 人。芝士拼盘也很出彩。店里的意大利罐头和干面可以买回家。', ['意大利', '火腿', '聚会'], { text: 'Alimentari Grande 探店笔记' }, { extracted_fields: { '店名': 'Alimentari Grande', '人均': '150 元', '适合场景': '朋友聚会' }, branch: '餐厅' }),
  makeSeed('f4', DEMO_TOPIC_IDS.food, 'food', 'link', '小红书 Oha Eatery 探店', '安福路上的贵州风味创意融合菜，每一季换菜单。环境像朋友家的客厅，轻松自在。需要提前预约。人均 180–250 元。', ['贵州菜', '创意', '安福路'], { text: 'https://example.com/oha-eatery' }, { source_url: 'https://example.com/oha-eatery', extracted_fields: { '店名': 'Oha Eatery', '人均': '220 元', '是否需要预约': '需要预约' }, missing_fields: ['营业时间'], branch: '餐厅' }),
];

// ---- 购物种草 seeds ----
const shoppingSeeds: Seed[] = [
  makeSeed('sh1', DEMO_TOPIC_IDS.shopping, 'shopping', 'image', 'Everlane 通勤包上身图', '极简托特包，米白色，容量可装 13 寸 MacBook。皮质柔软但有型，背带长度刚好不会滑落', ['通勤包', 'Everlane', '托特包'], { ocrText: 'Everlane Day Market Tote 通勤包' }, { missing_fields: ['价格', '购买渠道'], branch: '服饰' }),
  makeSeed('sh2', DEMO_TOPIC_IDS.shopping, 'shopping', 'link', 'Everlane 官网产品页', 'Day Market Tote 售价 $175，三色可选（黑/白/棕），免费配送美国境内。国际配送需转运。', ['Everlane', '官网', '价格'], { text: 'https://example.com/everlane-tote' }, { source_url: 'https://example.com/everlane-tote', extracted_fields: { '品牌': 'Everlane', '价格': '$175', '购买渠道': '官网' }, branch: '服饰' }),
  makeSeed('sh3', DEMO_TOPIC_IDS.shopping, 'shopping', 'text', 'A.P.C. 半月包种草笔记', '法国小众品牌，半月造型优雅不过时。可以斜挎也可以手拎，一包两用。皮质很好但偏硬。参考价格人民币 2800 左右，需要在买手店或海淘购买。', ['半月包', 'A.P.C.', '法式'], { text: 'A.P.C. 半月包种草笔记' }, { extracted_fields: { '品牌': 'A.P.C.', '价格': '2800 元', '风格': '简约/法式' }, missing_fields: ['购买渠道'], branch: '服饰' }),
];

// ---- 生活锦囊 seeds ----
const lifeSeeds: Seed[] = [
  makeSeed('l1', DEMO_TOPIC_IDS.life, 'life', 'image', '奶油风卧室改造前后对比图', '小红书博主的卧室改造案例 —— 墙面从灰色改为多乐士奶油白，视觉上空间大了很多，整个房间都明亮了', ['奶油风', '墙面', '对比'], { ocrText: '卧室改造 奶油白 前后对比' }, { missing_fields: ['预算'], branch: '步骤' }),
  makeSeed('l2', DEMO_TOPIC_IDS.life, 'life', 'link', 'MUJI 亚麻色床品推荐', '亚麻色纯棉四件套，水洗棉材质，越洗越软。一套含被套+床单+枕套×2，售价 ¥398', ['床品', '亚麻色', 'MUJI'], { text: 'https://example.com/muji-bedding' }, { source_url: 'https://example.com/muji-bedding', extracted_fields: { '品牌': 'MUJI', '价格': '398 元' }, branch: '要点' }),
  makeSeed('l3', DEMO_TOPIC_IDS.life, 'life', 'text', '氛围灯改造方案', '床头吊灯用宜家 HEKTAR 系列，落地灯用小米智能灯泡（色温 2700K-6500K 可调）。关键是色温统一在 3000K 左右，几个灯一起开才有氛围感。', ['氛围灯', '色温', '智能'], { text: '氛围灯改造方案笔记' }, { extracted_fields: { '要点': '色温统一 3000K，吊灯+落地灯组合' }, missing_fields: ['预算', '时间节点'], branch: '要点' }),
];

// ---- 审美灵感 seeds ----
const aestheticSeeds: Seed[] = [
  makeSeed('a1', DEMO_TOPIC_IDS.aesthetic, 'aesthetic', 'image', '韩国博主秋季通勤穿搭合集', '低饱和色系为主 —— 燕麦色针织 + 米白直筒裤 + 驼色风衣，整体色调非常统一。配饰只有一条细链和珍珠耳钉', ['通勤', '低饱和', '韩国博主'], { ocrText: '秋季通勤穿搭 低饱和色系 一周合集' }, { missing_fields: ['品牌', '价格'], branch: '色彩' }),
  makeSeed('a2', DEMO_TOPIC_IDS.aesthetic, 'aesthetic', 'link', 'Uniqlo U 系列 2026 秋冬预览', 'U 系列今年的针织衫颜色比往年更柔和，米白、燕麦、雾霾蓝三个基础色都值得收。版型偏宽松，建议选小一码。', ['Uniqlo', '针织', '基础色'], { text: 'https://example.com/uniqlo-u-2026aw' }, { source_url: 'https://example.com/uniqlo-u-2026aw', extracted_fields: { '品牌': 'Uniqlo U', '风格': '简约基础款' }, branch: '色彩' }),
  makeSeed('a3', DEMO_TOPIC_IDS.aesthetic, 'aesthetic', 'text', '垂感半裙搭配思路', '深灰百褶半裙 + 浅色针织 = 正式通勤；卡其色直筒半裙 + 白T + 风衣 = 休闲。两条半裙可以覆盖一周五天不同穿搭，非常实用。', ['半裙', '搭配', '通勤'], { text: '垂感半裙搭配思路笔记' }, { extracted_fields: { '单品': '百褶半裙 + 直筒半裙' }, missing_fields: ['颜色偏好'], branch: '构图' }),
];

// ============================================================
// 主题汇总
// ============================================================

export interface DemoTopicBundle {
  topic: Topic;
  seeds: Seed[];
  harvest: Harvest | null;
  harvestPreview: HarvestPreview | null;
}

export const demoTopics: Record<string, DemoTopicBundle> = {
  [DEMO_TOPIC_IDS.travel]: {
    topic: makeTopic(DEMO_TOPIC_IDS.travel, 'travel', '东京周末旅行灵感', 'bloom', 86, 28, 78, 82, 88, true, ['东京', '咖啡店', '散步路线', '美术馆', '预算', '晴天备选'], [], { '预算范围': '5000–8000 元', '计划出行日期': '9 月中旬', '旅行天数': '3 天 2 晚' }, 'tree', 'spring'),
    seeds: travelSeeds,
    harvest: travelHarvest,
    harvestPreview: travelHarvestPreview,
  },
  [DEMO_TOPIC_IDS.food]: {
    topic: makeTopic(DEMO_TOPIC_IDS.food, 'food', '上海 brunch 餐厅收藏', 'growing', 72, 19, 65, 70, 68, false, ['brunch', '咖啡', '周末', '朋友聚会', '静安', '露台'], ['人均预算', '偏好菜系'], { '城市': '上海', '用餐场景': '周末 brunch' }, 'herb', 'summer'),
    seeds: foodSeeds,
    harvest: null,
    harvestPreview: foodHarvestPreview,
  },
  [DEMO_TOPIC_IDS.shopping]: {
    topic: makeTopic(DEMO_TOPIC_IDS.shopping, 'shopping', '秋季通勤好物清单', 'growing', 64, 15, 58, 60, 62, false, ['通勤包', '香氛', '收纳', '质感单品', '秋季'], ['预算范围', '购买渠道'], { '使用场景': '日常通勤', '偏好风格': '简约 / 质感' }, 'flower', 'autumn'),
    seeds: shoppingSeeds,
    harvest: null,
    harvestPreview: shoppingHarvestPreview,
  },
  [DEMO_TOPIC_IDS.life]: {
    topic: makeTopic(DEMO_TOPIC_IDS.life, 'life', '卧室改造灵感', 'sprout', 43, 7, 35, 40, 38, false, ['奶油风', '收纳', '床品', '氛围灯', '香薰'], ['预算', '时间节点', '关注风险点'], {}, 'vine', 'spring'),
    seeds: lifeSeeds,
    harvest: null,
    harvestPreview: lifeHarvestPreview,
  },
  [DEMO_TOPIC_IDS.aesthetic]: {
    topic: makeTopic(DEMO_TOPIC_IDS.aesthetic, 'aesthetic', '轻职场穿搭灵感', 'sprout', 58, 11, 50, 52, 55, false, ['通勤', '低饱和色', '针织', '半裙', '简约'], ['颜色偏好', '预算范围'], { '风格偏好': '简约 / 通勤', '季节': '秋季' }, 'flower', 'spring'),
    seeds: aestheticSeeds,
    harvest: null,
    harvestPreview: aestheticHarvestPreview,
  },
};

// ============================================================
// 辅助函数
// ============================================================

/** 根据 gardenId 获取 demo 花圃卡片（不存在返回空） */
export function getDemoGardenCards(gardenId: string): GardenCardsResponse | null {
  if (gardenId in demoGardenCards) {
    return demoGardenCards[gardenId as GardenType];
  }
  return null;
}

/** 根据 topicId 获取 demo 主题数据 */
export function getDemoTopicBundle(topicId: string): DemoTopicBundle | null {
  return demoTopics[topicId] ?? null;
}

/** 模拟加载延迟（用于清单生成动画） */
export function simulateDelay(ms: number = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
