// src/app/api/seed/[seedId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  calcDensityScore,
  calcTopicCompletenessScore,
  calcStructureScore,
  calcGrowthScore,
  getStage,
  checkCanHarvest,
  detectTopicMissingFields,
  computeTopicAggregatedTags,
} from '@/lib/garden-engine';
import { GARDEN_CONFIG, STAGE_LABELS } from '@/lib/constants';
import type { GardenType, PlantStage, GrowthNarrative } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ seedId: string }> }
) {
  try {
    const { seedId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 字段白名单：只允许更新以下字段
    const allowedFields = ['content', 'source_url', 'tags', 'topic_id', 'garden_type', 'title', 'summary', 'extracted_fields', 'branch', 'user_notes'] as const;
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 判断是否需要重算生长值：仅 user_notes 更新时跳过
    const growthFields = ['content', 'tags', 'topic_id', 'garden_type', 'extracted_fields', 'branch', 'source_url'] as const;
    const shouldRecalc = growthFields.some((f) => body[f] !== undefined);

    // 获取更新前的种子（用于获取 topic_id）
    const { data: beforeSeed } = await supabase
      .from('seeds')
      .select('*')
      .eq('id', seedId)
      .eq('user_id', user.id)
      .single();

    // 获取更新前主题状态
    const topicId = (updateData.topic_id as string) || beforeSeed?.topic_id;
    let previousTopicState: {
      growth_score: number;
      stage: PlantStage;
      tags: string[];
    } | null = null;

    if (topicId) {
      const { data: topic } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .eq('user_id', user.id)
        .single();

      if (topic) {
        previousTopicState = {
          growth_score: topic.growth_score,
          stage: topic.stage,
          tags: topic.tags ?? [],
        };
      }
    }

    const { data: seed, error } = await supabase
      .from('seeds')
      .update(updateData)
      .eq('id', seedId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ========== 如果内容更新且有 topicId，重算主题生长状态 ==========
    let growthNarrative: GrowthNarrative | null = null;
    let updatedTopic: Record<string, unknown> | null = null;

    if (shouldRecalc && topicId && previousTopicState) {
      const gardenType = (updateData.garden_type as string) || beforeSeed?.garden_type;

      const { data: topicSeeds } = await supabase
        .from('seeds')
        .select('*')
        .eq('topic_id', topicId);

      const seedCount = topicSeeds?.length ?? 0;
      const density = calcDensityScore(seedCount);

      // 读取主题级已填字段（profile_fields），计算清单就绪度
      const { data: topicData } = await supabase
        .from('topics')
        .select('profile_fields')
        .eq('id', topicId)
        .single();
      const profileFields: Record<string, string> =
        (topicData?.profile_fields as Record<string, string>) ?? {};
      const filledTopicKeys = Object.keys(profileFields).filter((k) => profileFields[k]?.trim());
      const completeness = calcTopicCompletenessScore(gardenType as GardenType, filledTopicKeys);

      const allBranches: string[] = [...new Set(
        (topicSeeds ?? []).map((s) => s.branch).filter(Boolean) as string[]
      )];
      const structure = calcStructureScore(allBranches.length);

      const growth = calcGrowthScore(density, completeness, structure);
      const canHarvest = checkCanHarvest(gardenType as GardenType, allBranches, topicSeeds ?? []);
      const newStage = getStage(growth, canHarvest);
      const missingFields = detectTopicMissingFields(gardenType as GardenType, filledTopicKeys);

      const allTags = computeTopicAggregatedTags(
        topicSeeds ?? [],
        profileFields,
        gardenType as GardenType
      );

      const { data: topicResult } = await supabase
        .from('topics')
        .update({
          growth_score: growth,
          density_score: density,
          completeness_score: completeness,
          structure_score: structure,
          stage: newStage,
          can_harvest: canHarvest,
          missing_fields: missingFields,
          tags: allTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', topicId)
        .select()
        .single();

      updatedTopic = topicResult ?? null;

      const prevGrowth = previousTopicState.growth_score;
      const contributionScore = growth - prevGrowth;
      const newBranch = (updateData.branch as string) || undefined;
      const incomingTags = (updateData.tags ?? []) as string[];
      const addedTags = incomingTags.filter((t: string) => !previousTopicState.tags.includes(t));

      let narrativeText = '';
      if (contributionScore > 0 && newStage !== previousTopicState.stage) {
        narrativeText = `补充信息让生长值增加了 ${contributionScore} 点，从${STAGE_LABELS[previousTopicState.stage]}成长到了${STAGE_LABELS[newStage]}！`;
      } else if (contributionScore > 0) {
        narrativeText = `补充信息让生长值增加了 ${contributionScore} 点。`;
      } else {
        narrativeText = `信息已保存，继续补充可以让植物更快成长。`;
      }

      growthNarrative = {
        previousGrowthScore: prevGrowth,
        currentGrowthScore: growth,
        contributionScore,
        addedBranch: newBranch,
        addedTags,
        stageBefore: previousTopicState.stage,
        stageAfter: newStage,
        narrativeText,
      };
    }

    return NextResponse.json({ seed, topic: updatedTopic ?? null, growthNarrative });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('Seed PATCH error:', err.message, err.stack);
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status: 500 });
  }
}
