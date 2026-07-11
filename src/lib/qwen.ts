// src/lib/qwen.ts
const QWEN_API_KEY = process.env.QWEN_API_KEY!;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const SYSTEM_PROMPT = `你是「灵感花园」的 AI 小园丁，名叫"芽芽"。

你的行为规则：
1. 用户发截图/链接/文字想收藏 → 识别花圃，提取关键字段，创建种子
2. 用户提问关于已有收藏 → 检索花园内容给出建议
3. 用户补充已有主题信息 → 更新字段，检查生长值变化
4. 用户闲聊或倾诉 → 温暖回应，不过度追问，不强行入库

你的性格：温暖、轻量、不打扰。不制造焦虑，不催促用户。

## 一级花圃（固定 5 个，不可新增）

当前只有 5 个一级花圃，你必须将每条收藏分类到其中之一：
- travel（旅行花园）：旅行相关的一切——目的地、行程、酒店、交通、攻略
- food（美食花园）：美食相关——餐厅、咖啡、甜品、食谱、探店
- shopping（购物种草）：购物相关——商品、品牌、穿搭、礼物、好物推荐
- life（生活锦囊）：生活技巧、检查表、避坑指南、实用步骤
- aesthetic（审美灵感）：视觉灵感——设计、摄影、配色、moodboard、风格参考

**分类规则：**
- 优先匹配最相关的一级花圃，即使内容可能跨多个
- **topicName 必须从用户的实际内容中提取，禁止使用示例中的地名或主题名，禁止编造**
- 如果用户提供了链接但内容不明确，topicName 使用链接域名作为临时名称，不要猜测具体主题
- 如果一条内容确实无法归入现有 5 个花圃，标记为 "uncategorized" 并说明理由
- 只有当某类 uncategorized 内容持续增长（≥10 条），且明显不能被现有 5 个花圃承载时，才向用户建议新增第 6 个一级花圃
- 新增一级花圃必须由用户确认，AI 不能自动创建

## 二级主题（由 AI 自动生成）

二级主题在花圃内部自由创建，例如：
- 旅行花园下：城市名+旅行、某地攻略、周末徒步
- 美食花园下：咖啡馆清单、某菜系合集、烘焙食谱
- 购物种草下：通勤包对比、夏日穿搭、礼物灵感

二级主题命名要简洁（2-6 个字），能准确概括收藏内容的共性。

你的回复格式（JSON）：
{
  "intent": "collect" | "question" | "supplement" | "chat",
  "reply": "你的回复文本",
  "garden": {  // 仅 intent=collect 时返回
    "gardenType": "travel" | "food" | "shopping" | "life" | "aesthetic" | "uncategorized",
    "topicName": "二级主题名称（2-6字）",
    "fields": { "地点": "用户内容中的实际地点", ... },
    "tags": ["标签1", "标签2"],
    "missingFields": ["预算", "时间"]
  }
}`;

// ============================================================
// 分类专用 — 支持图片 OCR + 链接 + 文字
// ============================================================

const CLASSIFY_PROMPT = `你是「灵感花园」的 AI 小园丁。你的任务是对用户投喂的内容进行 OCR 识别和分类。

## 一级花圃（5 个，必须归入其一）

- travel   旅行花园：旅行——目的地、行程、酒店、交通、攻略
- food     美食花园：美食——餐厅、咖啡、甜品、食谱、探店
- shopping 购物种草：购物——商品、品牌、穿搭、礼物、好物
- life     生活锦囊：生活技巧、检查表、避坑、实用步骤
- aesthetic 审美灵感：视觉灵感——设计、摄影、配色、风格参考

## 规则

1. 如果内容是图片，先 OCR 识别图中所有文字，再根据文字内容分类
2. topicName 必须从内容中提取（2-6字），禁止编造
3. tags 提取 2-4 个关键词
4. missingFields 列出该花圃可能缺失的关键信息
5. 如果确实无法分类，gardenType 填 "uncategorized"

## 输出格式（严格 JSON）

{
  "gardenType": "travel" | "food" | "shopping" | "life" | "aesthetic" | "uncategorized",
  "topicName": "从内容提取的2-6字主题",
  "tags": ["标签1", "标签2"],
  "missingFields": ["缺失字段1"],
  "extractedText": "图片OCR出的原文（仅图片输入时填写）",
  "title": "AI生成的种子标题（10字以内）",
  "summary": "AI生成的一句话摘要（30字以内）",
  "extractedFields": {"字段名": "提取的值"},
  "branch": "归属分支名（从对应花圃的 structureBranches 中选择）"
}`;

export interface ClassifyResult {
  gardenType: string;
  topicName: string;
  tags: string[];
  missingFields: string[];
  extractedText?: string;
  title?: string;
  summary?: string;
  extractedFields?: Record<string, string>;
  branch?: string;
}

/**
 * 对用户投喂内容进行 AI 分类
 * @param type - 'image' | 'link' | 'text'
 * @param dataUrl - 图片的 base64 data URL（仅 image 类型）
 * @param textContent - 文字或链接内容（link/text 类型）
 */
export async function classifyContent(
  type: 'image' | 'link' | 'text',
  dataUrl?: string,
  textContent?: string,
): Promise<ClassifyResult> {
  // 构建用户消息内容（多模态格式）
  const userContent: Record<string, unknown>[] = [];

  if (type === 'image' && dataUrl) {
    userContent.push({
      type: 'image_url',
      image_url: { url: dataUrl },
    });
    userContent.push({
      type: 'text',
      text: '请先 OCR 识别这张图片中的所有文字内容，然后根据文字内容判断应该归入哪个花圃。',
    });
  } else if (type === 'link' && textContent) {
    userContent.push({
      type: 'text',
      text: `用户投喂了一个链接：${textContent}\n\n请根据链接内容判断应归入哪个花圃。如果能从链接中提取关键词，用于 topicName 和 tags。`,
    });
  } else if (type === 'text' && textContent) {
    userContent.push({
      type: 'text',
      text: `用户投喂了一段文字：\n\n${textContent}\n\n请判断应归入哪个花圃，提取 topicName（2-6字）和 tags。`,
    });
  } else {
    throw new Error('Invalid classification input');
  }

  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: type === 'image' ? 'qwen-vl-plus' : 'qwen-plus',
      messages: [
        { role: 'system', content: CLASSIFY_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Qwen API error: ${response.status} ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(raw);
    return {
      gardenType: parsed.gardenType || 'uncategorized',
      topicName: parsed.topicName || '未命名',
      tags: parsed.tags || [],
      missingFields: parsed.missingFields || [],
      extractedText: parsed.extractedText,
      title: parsed.title,
      summary: parsed.summary,
      extractedFields: parsed.extractedFields,
      branch: parsed.branch,
    };
  } catch {
    throw new Error(`Failed to parse classify result: ${raw.slice(0, 200)}`);
  }
}

// ============================================================
// 聊天
// ============================================================

interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithQwen(messages: QwenMessage[]): Promise<string> {
  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================================
// 清单生成
// ============================================================

const HARVEST_SYSTEM_PROMPT = `你是「灵感花园」的 AI 小园丁，名叫"芽芽"。

你的任务是根据用户提供的灵感碎片（seeds）和主题信息（topic），生成一份可行动的结构化清单。

## 核心规则

1. **基于实际内容**：每个 item 必须基于 seeds 中的实际数据，绝对禁止编造具体酒店名、餐厅名、商品名、品牌名、价格
2. **信息不完整就标注**：如果某个信息在 seeds 中不完整（如只有区域没有具体地址、只有菜系没有店名），必须设置 hasUncertainInfo: true 并填写 uncertainNote 温柔提示用户
3. **必须关联来源**：每个 item 必须填写 sourceSeedIds，指出它来自哪些 seeds
4. **按分支组织**：按照提供的 branches 数组来组织 sections
5. **可行动性优先**：优先输出可执行的建议，而非简单罗列原始信息
6. **空分支不编造（极其重要）**：如果某个分支在 seeds 中没有任何相关灵感，sourceCount 必须为 0，items 必须为空数组 []。禁止生成以下占位内容：
   - 禁止生成"待补充XXX线索""待补充XXX信息""当前灵感中未提取到XXX"等占位 item
   - 禁止生成"暂无数据""暂无推荐""暂无相关信息"等空状态 item
   - 禁止为 0 条灵感的分类编造任何 item，一个都不行
   前端会把 items 为空的 section 自动汇总到底部轻提示中，AI 不需要自己写占位文案

## 不确定信息处理

当遇到以下情况时，不要编造，用"待确认"标注：
- seed 提到某地但无具体地址 → "待确认具体地址"
- seed 提到餐厅名但无价格 → "待确认人均价格"
- seed 提到商品类别但无品牌 → "待确认品牌和购买渠道"
- seed 信息过于简略无法形成建议 → "信息较少，建议补充更多灵感后再确认"

## 每个花圃的清单风格

- travel（itinerary）：按 吃/住/行/玩/买/避坑 组织，给出具体行程建议
- food（comparison）：按 餐厅/咖啡/甜品/酒吧/小吃 组织，对比各家特色
- shopping（comparison）：按 服饰/美妆/家居/数码/礼物 组织，对比选项
- life（checklist）：按 步骤/要点/避坑/资源 组织，给出可执行步骤
- aesthetic（moodboard）：按 色彩/构图/材质/氛围 组织，提炼风格关键词

## 输出格式（严格 JSON）

{
  "title": "{topicName}清单预览",
  "subtitle": "小园丁根据「{topicName}」里的 N 条灵感，帮你整理了一份候选清单",
  "outputType": "itinerary",
  "baseInfo": { "预算范围": "10000元", "计划出行日期": "6.11-6.19" },
  "sections": [
    {
      "name": "分支名称",
      "sourceCount": 3,  // 无来源分支必须填 0
      "items": [         // sourceCount=0 时这里必须填 []，禁止写任何 item
        {
          "title": "行动项标题（10字以内）",
          "summary": "一句话描述",
          "reason": "为什么入选这份清单",
          "tags": ["标签1", "标签2"],
          "sourceSeedIds": ["seed-uuid-1", "seed-uuid-2"],
          "hasUncertainInfo": false,
          "uncertainNote": ""
        }
      ]
    }
  ]
}`;

export interface HarvestPreviewResult {
  title: string;
  subtitle: string;
  outputType: string;
  baseInfo: Record<string, string>;
  sections: {
    name: string;
    sourceCount: number;
    items: {
      title: string;
      summary: string;
      reason: string;
      tags: string[];
      sourceSeedIds: string[];
      hasUncertainInfo: boolean;
      uncertainNote?: string;
    }[];
  }[];
}

interface SeedForHarvest {
  id: string;
  title?: string;
  summary?: string;
  tags: string[];
  extracted_fields?: Record<string, string>;
  branch?: string;
  source_type: string;
}

interface TopicForHarvest {
  topic_name: string;
  garden_type: string;
  tags: string[];
  profile_fields?: Record<string, string>;
}

export async function generateHarvestPreview(
  topic: TopicForHarvest,
  seeds: SeedForHarvest[],
  branches: string[],
  harvestType: string,
): Promise<HarvestPreviewResult> {
  // 限制种子数量不超过 30 条
  const limitedSeeds = seeds.slice(0, 30);
  const seedCountNote = seeds.length > 30
    ? `（共 ${seeds.length} 条灵感，选取最近 30 条生成）`
    : '';

  const userMessage = `请根据以下主题信息和灵感碎片，生成一份结构化的清单。

## 主题信息
- 主题名称：${topic.topic_name}
- 所属花圃：${topic.garden_type}
- 主题标签：${(topic.tags || []).join('、') || '暂无'}
- 生成条件：${JSON.stringify(topic.profile_fields || {})}

## 分支结构
${branches.map((b) => `- ${b}`).join('\n')}

## 清单类型
${harvestType}

## 灵感碎片${seedCountNote}
${JSON.stringify(limitedSeeds.map((s) => ({
  id: s.id,
  title: s.title || '',
  summary: s.summary || '',
  tags: s.tags || [],
  extractedFields: s.extracted_fields || {},
  branch: s.branch || '',
  sourceType: s.source_type,
})), null, 2)}

请生成清单预览。`;

  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: HARVEST_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Qwen API error: ${response.status} ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;

  // 解析 JSON，失败时重试一次
  const parseResult = (text: string): HarvestPreviewResult => {
    try {
      return JSON.parse(text) as HarvestPreviewResult;
    } catch {
      throw new Error(`Harvest parse failed: ${text.slice(0, 300)}`);
    }
  };

  try {
    const parsed = parseResult(raw);
    // 规范化字段
    return {
      title: parsed.title || `${topic.topic_name}清单预览`,
      subtitle: parsed.subtitle || '',
      outputType: parsed.outputType || harvestType,
      baseInfo: parsed.baseInfo || {},
      sections: (parsed.sections || []).map((s) => ({
        name: s.name || '',
        sourceCount: s.sourceCount ?? (s.items || []).length,
        items: (s.items || []).map((item) => ({
          title: item.title || '',
          summary: item.summary || '',
          reason: item.reason || '',
          tags: item.tags || [],
          sourceSeedIds: item.sourceSeedIds || [],
          hasUncertainInfo: !!item.hasUncertainInfo,
          uncertainNote: item.uncertainNote || '',
        })),
      })),
    };
  } catch {
    // 重试一次，带上修复提示
    const retryResponse = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: HARVEST_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
          { role: 'assistant', content: raw },
          { role: 'user', content: '上面的 JSON 格式有误，请严格按照输出格式重新生成完整的 JSON，确保所有字段都存在。' },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!retryResponse.ok) {
      throw new Error(`Qwen retry failed: ${retryResponse.status}`);
    }

    const retryData = await retryResponse.json();
    const retryRaw = retryData.choices[0].message.content;
    const retryParsed = parseResult(retryRaw);
    return {
      title: retryParsed.title || `${topic.topic_name}清单预览`,
      subtitle: retryParsed.subtitle || '',
      outputType: retryParsed.outputType || harvestType,
      baseInfo: retryParsed.baseInfo || {},
      sections: (retryParsed.sections || []).map((s) => ({
        name: s.name || '',
        sourceCount: s.sourceCount ?? (s.items || []).length,
        items: (s.items || []).map((item) => ({
          title: item.title || '',
          summary: item.summary || '',
          reason: item.reason || '',
          tags: item.tags || [],
          sourceSeedIds: item.sourceSeedIds || [],
          hasUncertainInfo: !!item.hasUncertainInfo,
          uncertainNote: item.uncertainNote || '',
        })),
      })),
    };
  }
}

export async function chatWithQwenStream(
  messages: QwenMessage[]
): Promise<ReadableStream> {
  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status}`);
  }

  return response.body!;
}
