// src/app/garden/[gardenId]/[topicId]/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TopicDetail } from '@/components/garden/TopicDetail';
import type { Topic, Seed } from '@/types';

export default async function TopicPage({
  params,
}: {
  params: Promise<{ gardenId: string; topicId: string }>;
}) {
  const { topicId } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .eq('user_id', user.id)
    .single();

  if (!topic) notFound();

  const { data: seeds } = await supabase
    .from('seeds')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  return (
    <TopicDetail topic={topic as Topic} seeds={(seeds ?? []) as Seed[]} />
  );
}
