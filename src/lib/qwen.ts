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
- 如果一条内容确实无法归入现有 5 个花圃，标记为 "uncategorized" 并说明理由
- 只有当某类 uncategorized 内容持续增长（≥10 条），且明显不能被现有 5 个花圃承载时，才向用户建议新增第 6 个一级花圃
- 新增一级花圃必须由用户确认，AI 不能自动创建

## 二级主题（由 AI 自动生成）

二级主题在花圃内部自由创建，例如：
- 旅行花园下：东京旅行、大理攻略、周末徒步
- 美食花园下：咖啡馆清单、日料合集、烘焙食谱
- 购物种草下：通勤包对比、夏日穿搭、礼物灵感

二级主题命名要简洁（2-6 个字），能准确概括收藏内容的共性。

你的回复格式（JSON）：
{
  "intent": "collect" | "question" | "supplement" | "chat",
  "reply": "你的回复文本",
  "garden": {  // 仅 intent=collect 时返回
    "gardenType": "travel" | "food" | "shopping" | "life" | "aesthetic" | "uncategorized",
    "topicName": "二级主题名称（2-6字）",
    "fields": { "地点": "东京", ... },
    "tags": ["标签1", "标签2"],
    "missingFields": ["预算", "时间"]
  }
}`;

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
