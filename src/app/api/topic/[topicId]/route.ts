// src/app/api/topic/[topicId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  calcTopicCompletenessScore,
  calcGrowthScore,
  getStage,
  detectTopicMissingFields,
  computeTopicAggregatedTags,
} from '@/lib/garden-engine';
import type { GardenType, PlantStage, GrowthNarrative } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      profile_fields,
      topic_name,
      tags: newTags,
    } = body as {
      profile_fields?: Record<string, string>;
      topic_name?: string;
      tags?: string[];
    };

    // 至少需要一项有效输入
    const hasProfileFields = profile_fields && typeof profile_fields === 'object';
    const hasTopicName = typeof topic_name === 'string' && topic_name.trim().length > 0;
    const hasTags = Array.isArray(newTags) && newTags.length > 0;

    if (!hasProfileFields && !hasTopicName && !hasTags) {
      return NextResponse.json(
        { error: '需要提供 profile_fields、topic_name 或 tags' },
        { status: 400 }
      );
    }

    // 获取当前 topic
    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('user_id', user.id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // ---- 处理 profile_fields ----
    const existingFields: Record<string, string> =
      (topic.profile_fields as Record<string, string>) ?? {};
    const mergedFields = hasProfileFields
      ? { ...existingFields, ...profile_fields! }
      : existingFields;

    // ---- 处理 tags（合并去重） ----
    const existingTags: string[] = (topic.tags as string[]) ?? [];
    const mergedTags = hasTags
      ? [...new Set([...existingTags, ...(newTags ?? [])])]
      : existingTags;

    // ---- 处理 topic_name ----
    const finalName = hasTopicName ? topic_name!.trim() : topic.topic_name;

    // 构建 update 对象（只包含实际变更的字段）
    const updateData: Record<string, unknown> = {};

    if (hasProfileFields) {
      // 重算主题级完整度
      const filledKeys = Object.keys(mergedFields).filter((k) => mergedFields[k]?.trim());
      const topicCompleteness = calcTopicCompletenessScore(
        topic.garden_type as GardenType,
        filledKeys
      );

      const density = topic.density_score as number;
      const structure = topic.structure_score as number;
      const growth = calcGrowthScore(density, topicCompleteness, structure);
      const canHarvest = topic.can_harvest as boolean;
      const newStage = getStage(growth, canHarvest);
      const topicMissing = detectTopicMissingFields(topic.garden_type as GardenType, filledKeys);

      updateData.profile_fields = mergedFields;
      updateData.growth_score = growth;
      updateData.completeness_score = topicCompleteness;
      updateData.density_score = density;
      updateData.structure_score = structure;
      updateData.stage = newStage;
      updateData.can_harvest = canHarvest;
      updateData.missing_fields = topicMissing;
    }

    if (hasTopicName) {
      updateData.topic_name = finalName;
    }

    // 聚合主题级关联标签（从 seeds 中 AI 提取）
    const { data: tagSeeds } = await supabase
      .from('seeds')
      .select('tags, extracted_fields')
      .eq('topic_id', topicId);
    const aiTags = computeTopicAggregatedTags(
      tagSeeds ?? [],
      mergedFields,
      topic.garden_type as GardenType
    );

    // 合并 AI 标签 + 用户手动添加的标签（手动标签不被 AI 计算覆盖）
    const finalTags = [...new Set([...aiTags, ...mergedTags])];
    updateData.tags = finalTags;
    updateData.updated_at = new Date().toISOString();

    // 执行更新
    const { data: updatedTopic } = await supabase
      .from('topics')
      .update(updateData)
      .eq('id', topicId)
      .select()
      .single();

    // 构造简单的 growthNarrative（只有 profile_fields 变更时才计算）
    let growthNarrative: GrowthNarrative | undefined;
    if (hasProfileFields) {
      const prevGrowth = topic.growth_score as number;
      const growth = updateData.growth_score as number;
      const contributionScore = Math.round((growth - prevGrowth) * 10) / 10;
      const newStage = updateData.stage as PlantStage;

      let narrativeText = '';
      if (contributionScore > 0 && newStage !== topic.stage) {
        narrativeText = `补充信息让生长值增加了 ${contributionScore} 点，从「${topic.stage}」成长到了「${newStage}」！`;
      } else if (contributionScore > 0) {
        narrativeText = `补充信息让生长值增加了 ${contributionScore} 点，离高质量清单更近了一步。`;
      } else {
        narrativeText = `信息已保存，继续补充可以让清单更精准。`;
      }

      growthNarrative = {
        previousGrowthScore: prevGrowth,
        currentGrowthScore: growth,
        contributionScore,
        addedTags: [],
        stageBefore: topic.stage as PlantStage,
        stageAfter: newStage,
        narrativeText,
      };
    }

    return NextResponse.json({
      topic: updatedTopic,
      ...(growthNarrative ? { growthNarrative } : {}),
      ...(hasProfileFields
        ? {
            filledCount: Object.keys(mergedFields).filter((k) => mergedFields[k]?.trim()).length,
            totalFields: 5,
          }
        : {}),
    });
  } catch (e) {
    console.error('Topic PATCH error:', e);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
