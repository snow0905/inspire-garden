// src/app/api/classify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { classifyContent } from '@/lib/qwen';
import type { ClassifyResult } from '@/lib/qwen';
import { GARDEN_CONFIG } from '@/lib/constants';
import type { GardenType } from '@/types';

// ============================================================
// Mock 分类 — 基于关键词匹配，模拟 AI 分类效果
// 环境变量 MOCK_CLASSIFY=true 时启用
// ============================================================

const KEYWORD_RULES: { pattern: RegExp; gardenType: string; tags: string[]; missingFields: string[] }[] = [
  {
    pattern: /旅行|旅游|攻略|酒店|机票|行程|徒步|登山|出发|目的地|打卡|景点|民宿|青旅|签证|护照|贵州|大理|成都|东京|京都|巴黎|海岛|自驾|露营|滑雪|温泉/,
    gardenType: 'travel',
    tags: ['旅行'],
    missingFields: ['时间', '预算', '交通'],
  },
  {
    pattern: /美食|餐厅|咖啡|甜品|烘焙|探店|食谱|食材|料理|火锅|烧烤|日料|西餐|小吃|饮品|奶茶|酒吧|Brunch|早午餐/,
    gardenType: 'food',
    tags: ['美食'],
    missingFields: ['人均', '地址', '营业时间'],
  },
  {
    pattern: /购物|种草|品牌|穿搭|礼物|好物|推荐|单品|包包|鞋|衣服|首饰|化妆品|护肤|口红|香水|通勤包|对比|测评/,
    gardenType: 'shopping',
    tags: ['购物'],
    missingFields: ['价格', '购买渠道'],
  },
  {
    pattern: /技巧|检查表|避坑|步骤|指南|教程|清单|方法|经验|家务|收纳|整理|清洁|维修|DIY|手工/,
    gardenType: 'life',
    tags: ['生活'],
    missingFields: ['步骤', '要点'],
  },
  {
    pattern: /设计|摄影|配色|灵感|风格|参考|moodboard|海报|插画|排版|字体|UI|UX|建筑|室内|穿搭图|氛围|美学|视觉/,
    gardenType: 'aesthetic',
    tags: ['灵感'],
    missingFields: ['来源', '可应用场景'],
  },
];

function extractTopicName(input: string, maxLen = 6): string {
  // 尝试提取有意义的片段作为主题名
  const cleaned = input
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[，,。！!？?\s]+/g, ' ')
    .trim();

  // 查找关键词
  const locationMatch = cleaned.match(
    /(贵州|大理|成都|东京|京都|巴黎|杭州|苏州|重庆|西安|长沙|青岛|厦门|三亚|丽江|拉萨|桂林|[^\s]{2,4}(?:旅行|攻略|游记))/
  );
  if (locationMatch) return locationMatch[0].slice(0, maxLen);

  const foodMatch = cleaned.match(
    /(咖啡|甜品|烘焙|火锅|烧烤|日料|奶茶|[^\s]{2,4}(?:美食|探店|餐厅))/
  );
  if (foodMatch) return foodMatch[0].slice(0, maxLen);

  const shopMatch = cleaned.match(
    /(穿搭|礼物|通勤包|包包|口红|香水|[^\s]{2,4}(?:种草|推荐))/
  );
  if (shopMatch) return shopMatch[0].slice(0, maxLen);

  // 取前几个字
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 0) return words[0].slice(0, maxLen);

  return '新灵感';
}

function extractTags(input: string): string[] {
  const allTags: string[] = [];
  const tagPatterns = [
    /贵州|大理|成都|东京/g, /旅行|徒步|自驾|露营/g, /美食|咖啡|甜品|探店/g,
    /穿搭|种草|礼物/g, /设计|摄影|配色/g, /酒店|民宿/g, /火锅|烧烤|日料/g,
  ];
  for (const p of tagPatterns) {
    const matches = input.match(p);
    if (matches) allTags.push(...matches);
  }
  return [...new Set(allTags)].slice(0, 4);
}

function generateTitle(input: string, gardenType: string): string {
  const cleaned = input.replace(/https?:\/\/\S+/g, '').trim();
  if (gardenType === 'travel') {
    const m = cleaned.match(/([^\s]{2,4}(?:旅行|攻略|游记|之旅)|[^\s]{2,4}行|去[^\s]{2,4})/);
    if (m) return m[0].slice(0, 10);
  }
  if (gardenType === 'food') {
    const m = cleaned.match(/([^\s]{2,4}(?:美食|探店|打卡)|[^\s]{2,6}(?:餐厅|咖啡|甜品|火锅|烧烤|日料))/);
    if (m) return m[0].slice(0, 10);
  }
  if (gardenType === 'shopping') {
    const m = cleaned.match(/([^\s]{2,4}(?:种草|推荐|好物|礼物)|[^\s]{2,6}(?:穿搭|包包|口红|香水))/);
    if (m) return m[0].slice(0, 10);
  }
  if (gardenType === 'life') {
    const m = cleaned.match(/([^\s]{2,4}(?:技巧|指南|检查表|清单|方法))/);
    if (m) return m[0].slice(0, 10);
  }
  if (gardenType === 'aesthetic') {
    const m = cleaned.match(/([^\s]{2,4}(?:灵感|设计|配色|风格|参考))/);
    if (m) return m[0].slice(0, 10);
  }
  return cleaned.slice(0, 10) || '新灵感';
}

function generateSummary(input: string, gardenType: string): string {
  const cleaned = input.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 30) return cleaned;
  if (gardenType === 'travel') return `旅行灵感：${cleaned.slice(0, 24)}...`;
  if (gardenType === 'food') return `美食发现：${cleaned.slice(0, 24)}...`;
  if (gardenType === 'shopping') return `种草好物：${cleaned.slice(0, 24)}...`;
  if (gardenType === 'life') return `生活锦囊：${cleaned.slice(0, 24)}...`;
  if (gardenType === 'aesthetic') return `审美灵感：${cleaned.slice(0, 24)}...`;
  return cleaned.slice(0, 28) + '...';
}

function generateExtractedFields(input: string, gardenType: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const config = GARDEN_CONFIG[gardenType as GardenType];
  if (!config) return fields;

  const cleaned = input.replace(/https?:\/\/\S+/g, '').trim();

  // 通用字段提取规则
  const patterns: Record<string, RegExp[]> = {
    '地点': [/([^\s]{2,4}(?:市|县|区|州|岛))/],
    '店名': [/([^\s]{2,6}(?:餐厅|咖啡|甜品|火锅|烧烤|日料|酒店|民宿|酒吧|小吃))/],
    '人均': [/(\d{2,4})\s*元/],
    '价格': [/(\d{2,6})\s*元/],
    '品牌': [/([A-Z][a-z]+(?:[A-Z][a-z]+)*|[^\s]{2,6}(?:品牌|家|店))/],
    '城市': [/([^\s]{2,4}(?:市|省))/],
    '风格标签': [/(极简|复古|日系|北欧|工业|法式|美式|中式|波西米亚|赛博朋克)/],
  };

  for (const field of config.fields) {
    const fieldPatterns = patterns[field];
    if (!fieldPatterns) continue;
    for (const p of fieldPatterns) {
      const m = cleaned.match(p);
      if (m) {
        fields[field] = m[1];
        break;
      }
    }
  }

  return fields;
}

function matchBranch(input: string, gardenType: string): string | undefined {
  const config = GARDEN_CONFIG[gardenType as GardenType];
  if (!config) return undefined;

  const branches = config.structureBranches;

  // 关键词映射到分支
  const branchKeywords: Record<string, RegExp[]> = {
    '吃': [/餐厅|美食|吃饭|小吃|火锅|烧烤|日料|探店|菜品|味道/],
    '住': [/酒店|民宿|住宿|青旅|airbnb|bnb|入住|房间/],
    '行': [/交通|机票|火车|高铁|自驾|徒步|路线|行程/],
    '玩': [/景点|打卡|游览|观光|体验|活动|游玩|乐园|博物馆/],
    '买': [/购物|买|代购|免税|商场|逛街|纪念品|特产/],
    '避坑': [/避坑|注意事项|别去|不要|不建议|雷区|陷阱|踩雷/],
    '餐厅': [/餐厅|饭店|馆子|吃饭|早茶|酒楼|食堂/],
    '咖啡': [/咖啡|cafe|café|拿铁|美式|手冲|冷萃|咖啡店/],
    '甜品': [/甜品|甜点|蛋糕|冰淇淋|gelato|马卡龙|布丁|泡芙|烘焙|面包|可颂/],
    '酒吧': [/酒吧|bar|精酿|cocktail|鸡尾酒|威士忌|清酒|酒馆|小酒馆/],
    '小吃': [/小吃|路边摊|夜市|汉堡|街头|炸鸡|串串|烤串/],
    '服饰': [/衣服|穿搭|裙子|裤子|外套|衬衫|T恤|卫衣|鞋|包|首饰|配饰/],
    '美妆': [/护肤|化妆品|口红|香水|粉底|精华|面霜|面膜|眼影|腮红/],
    '家居': [/家居|家具|灯具|地毯|餐具|杯子|香薰|蜡烛|抱枕|床品/],
    '数码': [/手机|电脑|耳机|相机|平板|switch|游戏|键盘|鼠标|显示器/],
    '礼物': [/礼物|送礼|生日|纪念日|情人节|圣诞|新年礼物/],
    '步骤': [/步骤|第一步|第二步|流程|方法|怎么做|操作/],
    '要点': [/要点|重点|关键|核心|必须|一定要|记住/],
    '资源': [/链接|网址|网站|app|工具|资源|模板|素材/],
    '色彩': [/配色|颜色|色彩|调色|色板|色系|暖色|冷色/],
    '构图': [/构图|布局|排版|版式|结构|框架/],
    '材质': [/材质|纹理|质感|材料|面料|肌理/],
    '氛围': [/氛围|感觉|风格|调性|情绪|基调/],
  };

  for (const branch of branches) {
    const keywords = branchKeywords[branch];
    if (!keywords) continue;
    for (const k of keywords) {
      if (k.test(input)) return branch;
    }
  }

  return undefined;
}

function mockClassify(type: string, dataUrl?: string, textContent?: string): ClassifyResult {
  // 模拟 OCR 延迟
  const input = type === 'image'
    ? (dataUrl ? '[图片内容已读取]' : '')
    : (textContent ?? '');

  // 用关键词规则匹配
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(input)) {
      const gt = rule.gardenType;
      const tags = [...new Set([...rule.tags, ...extractTags(input)])].slice(0, 4);
      return {
        gardenType: gt,
        topicName: extractTopicName(input),
        tags,
        missingFields: rule.missingFields,
        extractedText: type === 'image' ? '(mock) 图片OCR文字：' + input.slice(0, 100) : undefined,
        title: generateTitle(input, gt),
        summary: generateSummary(input, gt),
        extractedFields: generateExtractedFields(input, gt),
        branch: matchBranch(input, gt),
      };
    }
  }

  // 默认归入旅行花园
  const defaultGt = 'travel';
  return {
    gardenType: defaultGt,
    topicName: extractTopicName(input),
    tags: extractTags(input).length > 0 ? extractTags(input) : ['待分类'],
    missingFields: ['补充描述'],
    extractedText: type === 'image' ? '(mock) 图片OCR文字：' + input.slice(0, 100) : undefined,
    title: generateTitle(input, defaultGt),
    summary: generateSummary(input, defaultGt),
    extractedFields: generateExtractedFields(input, defaultGt),
    branch: matchBranch(input, defaultGt),
  };
}

// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, dataUrl, textContent } = await request.json();

    if (!type || !['image', 'link', 'text'].includes(type)) {
      return NextResponse.json({ error: 'type 必须为 image | link | text' }, { status: 400 });
    }

    // Mock 模式：用关键词匹配代替 AI 调用
    if (process.env.MOCK_CLASSIFY === 'true') {
      // 模拟网络延迟
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      return NextResponse.json(mockClassify(type, dataUrl, textContent));
    }

    const result = await classifyContent(type, dataUrl, textContent);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Classify error:', error);
    const message = error instanceof Error ? error.message : '分类失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
