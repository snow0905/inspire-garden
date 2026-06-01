// src/components/home/mock-data.ts
import type { HomeSummary } from '@/types';

export const mockHomeSummary: HomeSummary = {
  user: { name: 'FJY', avatarUrl: '/assets/avatar.png' },
  greeting: {
    title: '下午好，今天你的灵感花园又长大了一点。',
    recentKeywords: ['东京', '咖啡', '通勤包', '女生独行'],
  },
  gardens: [
    { gardenId: 'travel', name: '旅行花园', icon: '🧳', topicCount: 6, bloomingCount: 2, latestAction: '新增东京旅行计划种子' },
    { gardenId: 'food', name: '美食花园', icon: '🍜', topicCount: 8, bloomingCount: 3, latestAction: '东京美食清单已开花' },
    { gardenId: 'shopping', name: '购物种草', icon: '🛍️', topicCount: 5, bloomingCount: 1, latestAction: '通勤包灵感已种下' },
    { gardenId: 'life', name: '生活锦囊', icon: '💡', topicCount: 7, bloomingCount: 2, latestAction: '整理独自旅行检查表' },
    { gardenId: 'aesthetic', name: '审美灵感', icon: '🎨', topicCount: 6, bloomingCount: 1, latestAction: '收藏夏日穿搭灵感' },
  ],
  actionableTopics: [
    { topicId: 't1', topicName: '东京旅行计划', gardenType: 'travel' },
    { topicId: 't2', topicName: '礼物灵感果树', gardenType: 'shopping' },
    { topicId: 't3', topicName: '独自美食灵感', gardenType: 'food' },
  ],
  wateringSeeds: [
    { topicId: 'w1', topicName: '通勤包灵感', missingFields: ['图片'] },
    { topicId: 'w2', topicName: '装修灵感', missingFields: ['图片'] },
    { topicId: 'w3', topicName: '夏日穿搭', missingFields: ['搭配'] },
  ],
  recentSeeds: [
    { label: '大阪小众美术馆', time: '今天 14:32' },
    { label: '通勤包新配色灵感', time: '昨天 21:18' },
  ],
  recentBloomingTopics: [
    { label: '东京旅行计划', time: '今天 10:15' },
    { label: '独自美食灵感', time: '昨天 19:42' },
  ],
  gardenReview: {
    label: '五月灵感回顾',
    count: 24,
  },
  gardenObservation: '你最近对「东京旅行」「咖啡馆灵感」「通勤包搭配」很感兴趣，灵感正在悄悄生长。',
};
