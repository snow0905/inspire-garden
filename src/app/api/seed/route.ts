// src/app/api/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gardenType, sourceType, content, sourceUrl, tags, topicId } = await request.json();

    const { data: seed, error } = await supabase
      .from('seeds')
      .insert({
        user_id: user.id,
        garden_type: gardenType,
        source_type: sourceType,
        content: content ?? {},
        source_url: sourceUrl,
        tags: tags ?? [],
        topic_id: topicId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 更新 garden_state
    const { data: state } = await supabase
      .from('garden_state')
      .select('total_seeds')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('garden_state')
      .upsert({
        user_id: user.id,
        total_seeds: (state?.total_seeds ?? 0) + 1,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ seed });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
