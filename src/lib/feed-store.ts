// 投喂灵感 Modal 全局触发器 —— 深层组件通过它请求打开 FeedModal

let pending = false;
const listeners = new Set<() => void>();

export function getFeedPending(): boolean {
  return pending;
}

/** 请求打开投喂灵感 Modal */
export function requestFeed(): void {
  pending = true;
  listeners.forEach((fn) => fn());
}

/** 消费请求（打开 Modal 后清空） */
export function clearFeedRequest(): void {
  pending = false;
}

export function subscribeFeed(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
