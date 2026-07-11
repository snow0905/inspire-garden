// src/app/api/seed/[seedId]/move/route.ts
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
import { GARDEN_CONFIG } from '@/lib/constants';
import type { GardenType } from '@/types';

async function recalcAndUpdateTopic(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  topicId: string,
  gardenType: GardenType,
): Promise<Record<string, unknown> | null> {
  const { data: topicSeeds } = await supabase
    .from('seeds')
    .select('*')
    .eq('topic_id', topicId);

  const seedCount = topicSeeds?.length ?? 0;
  const density = calcDensityScore(seedCount);

  // 读取主题级已填字段（profile_fields）
  const { data: topicData } = await supabase
    .from('topics')
    .select('profile_fields')
    .eq('id', topicId)
    .single();
  const profileFields: Record<string, string> =
    (topicData?.profile_fields as Record<string, string>) ?? {};
  const filledTopicKeys = Object.keys(profileFields).filter((k) => profileFields[k]?.trim());
  const completeness = calcTopicCompletenessScore(gardenType, filledTopicKeys);

  const allBranches: string[] = [...new Set(
    (topicSeeds ?? []).map((s) => s.branch).filter(Boolean) as string[]
  )];
  const structure = calcStructureScore(allBranches.length);

  const growth = calcGrowthScore(density, completeness, structure);
  const canHarvest = checkCanHarvest(gardenType, allBranches, topicSeeds ?? []);
  const newStage = getStage(growth, canHarvest);
  const missingFields = detectTopicMissingFields(gardenType, filledTopicKeys);

  const allTags = computeTopicAggregatedTags(
    topicSeeds ?? [],
    profileFields,
    gardenType
  );

  const { data: updatedTopic } = await supabase
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

  return updatedTopic ?? null;
}

export async function POST(
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

    const { targetTopicId, targetGardenType } = await request.json();

    // 至少需要目标花园类型
    const validGardens = Object.keys(GARDEN_CONFIG);
    if (!targetGardenType || !validGardens.includes(targetGardenType)) {
      return NextResponse.json({ error: 'targetGardenType 为必填参数，且必须是有效的一级花圃' }, { status: 400 });
    }

    // 如果指定了目标主题，验证其存在且属于当前用户
    let targetTopic: { id: string; garden_type: string } | null = null;
    let resolvedTargetTopicId: string | null = targetTopicId || null;

    if (resolvedTargetTopicId) {
      const { data: topic } = await supabase
        .from('topics')
        .select('id, garden_type')
        .eq('id', resolvedTargetTopicId)
        .eq('user_id', user.id)
        .single();
      if (!topic) {
        return NextResponse.json({ error: '目标主题不存在' }, { status: 404 });
      }
      targetTopic = topic;
    } else {
      // 未指定目标主题时，自动找一个或创建一个默认主题
      const { data: existingTopics } = await supabase
        .from('topics')
        .select('id, garden_type, topic_name')
        .eq('user_id', user.id)
        .eq('garden_type', targetGardenType)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (existingTopics && existingTopics.length > 0) {
        // 使用最近更新的主题
        targetTopic = existingTopics[0];
        resolvedTargetTopicId = targetTopic.id;
      } else {
        // 创建一个默认主题
        const gardenConfig = GARDEN_CONFIG[targetGardenType as GardenType];
        const defaultName = `默认${gardenConfig.name}`;
        const { data: newTopic, error: createErr } = await supabase
          .from('topics')
          .insert({
            user_id: user.id,
            garden_type: targetGardenType,
            topic_name: defaultName,
            plant_family: 'herb',
            stage: 'seed',
            growth_score: 0,
            density_score: 0,
            completeness_score: 0,
            structure_score: 0,
            can_harvest: false,
            tags: [],
            missing_fields: gardenConfig.topicFields ?? [],
            color_variant: 'variant-a',
          })
          .select()
          .single();

        if (createErr || !newTopic) {
          console.error('创建默认主题失败:', createErr);
          return NextResponse.json({ error: '创建默认主题失败' }, { status: 500 });
        }
        targetTopic = newTopic;
        resolvedTargetTopicId = newTopic.id;
      }
    }

    // 获取当前种子
    const { data: seed } = await supabase
      .from('seeds')
      .select('*')
      .eq('id', seedId)
      .eq('user_id', user.id)
      .single();

    if (!seed) {
      return NextResponse.json({ error: '种子不存在' }, { status: 404 });
    }

    const sourceTopicId = seed.topic_id;

    // 更新 seed：关联到解析后的目标主题
    const updateData: Record<string, unknown> = {
      garden_type: targetGardenType,
      topic_id: resolvedTargetTopicId,
    };

    const { data: updatedSeed, error: updateError } = await supabase
      .from('seeds')
      .update(updateData)
      .eq('id', seedId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 重新计算原主题
    let sourceTopicResult: Record<string, unknown> | null = null;
    if (sourceTopicId) {
      const sourceGardenType = (seed.garden_type as GardenType);
      sourceTopicResult = await recalcAndUpdateTopic(supabase, sourceTopicId, sourceGardenType);
    }

    // 重新计算目标主题
    let targetTopicResult: Record<string, unknown> | null = null;
    if (resolvedTargetTopicId && targetTopic) {
      const resolvedTargetGardenType = (targetGardenType || targetTopic.garden_type) as GardenType;
      targetTopicResult = await recalcAndUpdateTopic(supabase, resolvedTargetTopicId, resolvedTargetGardenType);
    }

    return NextResponse.json({
      seed: updatedSeed,
      sourceTopic: sourceTopicResult,
      targetTopic: targetTopicResult,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('Seed move error:', err.message, err.stack);
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status: 500 });
  }
}
