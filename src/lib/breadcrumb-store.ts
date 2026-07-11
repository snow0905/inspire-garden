// 面包屑全局 store —— 页面设置面包屑，TopNav 读取显示

export interface BreadcrumbItem {
  label: string;
  href?: string; // 无 href 表示当前页（不可点击）
}

let items: BreadcrumbItem[] = [];
const listeners = new Set<() => void>();

export function getBreadcrumbs(): BreadcrumbItem[] {
  return items;
}

export function setBreadcrumbs(next: BreadcrumbItem[]) {
  items = next;
  listeners.forEach((fn) => fn());
}

export function subscribeBreadcrumbs(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
