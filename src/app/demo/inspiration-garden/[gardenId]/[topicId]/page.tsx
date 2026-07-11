// src/app/demo/inspiration-garden/[gardenId]/[topicId]/page.tsx
// Demo 主题详情页 —— 复用 TopicDetail 组件，mode='demo'
'use client';

import { useParams, notFound } from 'next/navigation';
import { TopicDetail } from '@/components/garden/TopicDetail';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { getDemoTopicBundle } from '@/lib/demo-data';

function DemoTopicContent() {
  const params = useParams();
  const topicId = params.topicId as string;
  const { showToast } = useToast();

  const bundle = getDemoTopicBundle(topicId);

  if (!bundle) notFound();

  return (
    <>
      <DemoBanner />
      <TopicDetail
        topic={bundle.topic}
        seeds={bundle.seeds}
        mode="demo"
        demoHarvest={bundle.harvest}
        demoHarvestPreview={bundle.harvestPreview}
        onDemoToast={showToast}
      />
    </>
  );
}

export default function DemoTopicPage() {
  return (
    <ToastProvider>
      <DemoTopicContent />
    </ToastProvider>
  );
}
