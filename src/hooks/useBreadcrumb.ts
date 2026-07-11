// hooks/useBreadcrumb.ts
'use client';

import { useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import {
  getBreadcrumbs,
  setBreadcrumbs,
  subscribeBreadcrumbs,
  type BreadcrumbItem,
} from '@/lib/breadcrumb-store';

/** TopNav 用它读取当前面包屑 */
export function useBreadcrumb(): BreadcrumbItem[] {
  return useSyncExternalStore(
    subscribeBreadcrumbs,
    getBreadcrumbs,
    () => [], // SSR 时返回空数组
  );
}

/** 页面组件用它设置面包屑，离开时自动清空 */
export function useSetBreadcrumb(items: BreadcrumbItem[]) {
  // 用 JSON 做稳定比较，避免 items 字面量导致的无限 effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => items, [JSON.stringify(items)]);

  useEffect(() => {
    setBreadcrumbs(stable);
    return () => setBreadcrumbs([]);
  }, [stable]);
}
