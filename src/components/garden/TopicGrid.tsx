// src/components/garden/TopicGrid.tsx
import type { TopicCard as TopicCardType } from '@/types';
import { TopicCard } from './TopicCard';
import { COLORS } from '@/lib/constants';

interface TopicGridProps {
  topics: TopicCardType[];
  gardenId: string;
}

export function TopicGrid({ topics, gardenId }: TopicGridProps) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: COLORS.deepBrown }}>
        <span className="text-5xl mb-4">🌱</span>
        <p className="text-lg">这里还是一片空地</p>
        <p className="text-sm mt-1">投喂几条灵感，让种子发芽吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <TopicCard key={topic.topicId} topic={topic} gardenId={gardenId} />
      ))}
    </div>
  );
}
