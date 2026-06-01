// src/app/api/garden/[gardenId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { GardenType } from '@/types';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const { gardenId } = await params;

    if (!VALID_GARDENS.includes(gardenId as GardenType)) {
      return NextResponse.json({ error: 'Invalid garden type' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user.id)
      .eq('garden_type', gardenId)
      .order('updated_at', { ascending: false });

    return NextResponse.json({ gardenType: gardenId, topics: topics ?? [] });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
