// src/app/api/seed/route.ts
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
import type { GardenType, PlantFamily, PlantStage, GrowthNarrative } from '@/types';

const FAMILY_MAP: Record<string, PlantFamily> = {
  travel: 'tree',
  food: 'herb',
  shopping: 'flower',
  life: 'vine',
  aesthetic: 'flower',
};

function buildNarrativeText(
  isNewTopic: boolean,
  topicName: string,
  gardenType: string,
  contributionScore: number,
  stageBefore: PlantStage,
  stageAfter: PlantStage,
): string {
  if (isNewTopic) {
    return `新主题「${topicName}」诞生了！这是你在${GARDEN_CONFIG[gardenType as GardenType]?.name ?? ''}种下的第一颗种子。`;
  }
  if (contributionScore > 0 && stageAfter !== stageBefore) {
    return `这条灵感为「${topicName}」贡献了 ${contributionScore} 点生长值，并且从${STAGE_LABELS[stageBefore]}成长到了${STAGE_LABELS[stageAfter]}！`;
  }
  if (contributionScore > 0) {
    return `这条灵感为「${topicName}」贡献了 ${contributionScore} 点生长值，离${STAGE_LABELS[stageAfter]}更近了一步。`;
  }
  return `这条灵感已加入「${topicName}」，继续补充信息可以让它更快成长。`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gardenType, sourceType, content, sourceUrl, tags, topicId, topicName, imageUrl, title, summary, extractedFields, missingFields, branch, userNotes } = body;

    // ========== Find-or-create 主题 ==========
    let resolvedTopicId = topicId ?? null;
    let isNewTopic = false;
    let previousTopicState: {
      growth_score: number;
      stage: PlantStage;
      tags: string[];
      density_score: number;
      completeness_score: number;
      structure_score: number;
    } | null = null;

    if (!resolvedTopicId && topicName && gardenType) {
      const { data: existing } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .eq('garden_type', gardenType)
        .eq('topic_name', topicName)
        .maybeSingle();

      if (existing) {
        resolvedTopicId = existing.id;
        previousTopicState = {
          growth_score: existing.growth_score,
          stage: existing.stage,
          tags: existing.tags ?? [],
          density_score: existing.density_score,
          completeness_score: existing.completeness_score,
          structure_score: existing.structure_score,
        };
        await supabase
          .from('topics')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        isNewTopic = true;
        const { data: newTopic } = await supabase
          .from('topics')
          .insert({
            user_id: user.id,
            garden_type: gardenType as GardenType,
            topic_name: topicName,
            plant_family: FAMILY_MAP[gardenType] ?? 'tree',
            stage: 'seed' as const,
            growth_score: 0,
            density_score: 0,
            completeness_score: 0,
            structure_score: 0,
            can_harvest: false,
            tags: tags ?? [],
            missing_fields: [],
            color_variant: 'green',
          })
          .select('*')
          .single();

        if (newTopic) {
          resolvedTopicId = newTopic.id;
          previousTopicState = {
            growth_score: 0,
            stage: 'seed',
            tags: tags ?? [],
            density_score: 0,
            completeness_score: 0,
            structure_score: 0,
          };
        }
      }
    } else if (resolvedTopicId) {
      const { data: existing } = await supabase
        .from('topics')
        .select('*')
        .eq('id', resolvedTopicId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        previousTopicState = {
          growth_score: existing.growth_score,
          stage: existing.stage,
          tags: existing.tags ?? [],
          density_score: existing.density_score,
          completeness_score: existing.completeness_score,
          structure_score: existing.structure_score,
        };
      }
    }

    if (!resolvedTopicId || !previousTopicState) {
      return NextResponse.json({ error: '无法确定主题' }, { status: 400 });
    }

    // ========== 插入种子 ==========
    const seedData: Record<string, unknown> = {
      user_id: user.id,
      garden_type: gardenType,
      source_type: sourceType,
      content: content ?? {},
      source_url: sourceUrl ?? null,
      tags: tags ?? [],
      topic_id: resolvedTopicId,
    };
    if (imageUrl) seedData.image_url = imageUrl;
    if (title) seedData.title = title;
    if (summary) seedData.summary = summary;
    if (extractedFields) seedData.extracted_fields = extractedFields;
    if (missingFields) seedData.missing_fields = missingFields;
    if (branch) seedData.branch = branch;
    if (userNotes) seedData.user_notes = userNotes;

    const { data: seed, error } = await supabase
      .from('seeds')
      .insert(seedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ========== 更新 garden_state ==========
    const { data: state } = await supabase
      .from('garden_state')
      .select('total_seeds, total_topics')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('garden_state')
      .upsert({
        user_id: user.id,
        total_seeds: (state?.total_seeds ?? 0) + 1,
        total_topics: isNewTopic ? (state?.total_topics ?? 0) + 1 : (state?.total_topics ?? 0),
        updated_at: new Date().toISOString(),
      });

    // ========== 重算主题生长状态 ==========
    const { data: topicSeeds } = await supabase
      .from('seeds')
      .select('*')
      .eq('topic_id', resolvedTopicId);

    const seedCount = topicSeeds?.length ?? 0;
    const density = calcDensityScore(seedCount);

    // 读取主题级已填字段（profile_fields），计算清单就绪度
    const { data: existingTopic } = await supabase
      .from('topics')
      .select('profile_fields')
      .eq('id', resolvedTopicId)
      .single();
    const profileFields: Record<string, string> =
      (existingTopic?.profile_fields as Record<string, string>) ?? {};
    const filledTopicKeys = Object.keys(profileFields).filter((k) => profileFields[k]?.trim());
    const completeness = calcTopicCompletenessScore(gardenType as GardenType, filledTopicKeys);

    // 收集所有分支
    const allBranches: string[] = [...new Set(
      (topicSeeds ?? []).map((s) => s.branch).filter(Boolean) as string[]
    )];
    const structure = calcStructureScore(allBranches.length);

    const growth = calcGrowthScore(density, completeness, structure);
    const canHarvest = checkCanHarvest(gardenType as GardenType, allBranches, topicSeeds ?? []);
    const newStage = getStage(growth, canHarvest);
    const detectedMissing = detectTopicMissingFields(gardenType as GardenType, filledTopicKeys);

    // 聚合主题级关联标签
    const allTags = computeTopicAggregatedTags(
      topicSeeds ?? [],
      profileFields,
      gardenType as GardenType
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
        missing_fields: detectedMissing,
        tags: allTags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resolvedTopicId)
      .select()
      .single();

    // ========== 构建生长叙事 ==========
    const prevGrowth = previousTopicState.growth_score;
    const contributionScore = growth - prevGrowth;
    const prevTags = previousTopicState.tags ?? [];
    const incomingTags = (tags ?? []) as string[];
    const addedTags = incomingTags.filter((t: string) => !prevTags.includes(t));

    const growthNarrative: GrowthNarrative = {
      previousGrowthScore: prevGrowth,
      currentGrowthScore: growth,
      contributionScore,
      addedBranch: branch || undefined,
      addedTags,
      stageBefore: previousTopicState.stage,
      stageAfter: newStage,
      narrativeText: buildNarrativeText(isNewTopic, topicName ?? '', gardenType, contributionScore, previousTopicState.stage, newStage),
    };

    return NextResponse.json({ seed, topic: updatedTopic ?? null, topicId: resolvedTopicId, growthNarrative });
  } catch (e) {
    console.error('Seed POST error:', e);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
