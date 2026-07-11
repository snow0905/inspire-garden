// src/app/api/classify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { classifyContent } from '@/lib/qwen';

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

    const result = await classifyContent(type, dataUrl, textContent);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Classify error:', error);
    const message = error instanceof Error ? error.message : '分类失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
