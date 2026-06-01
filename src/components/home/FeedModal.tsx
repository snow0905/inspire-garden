// src/components/home/FeedModal.tsx
'use client';

import { useState, useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { COLORS } from '@/lib/constants';

type FeedTab = 'screenshot' | 'link' | 'text';
type FeedState = 'idle' | 'uploading' | 'analyzing' | 'classified' | 'saved';

interface FeedResult {
  gardenType: string;
  topicName: string;
  tags: string[];
  missingFields: string[];
}

const MOCK_RESULT: FeedResult = {
  gardenType: '旅行花园',
  topicName: '东京旅行树',
  tags: ['酒店', '女生独行', '交通便利'],
  missingFields: ['预算', '出行时间'],
};

interface FeedModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedModal({ open, onClose }: FeedModalProps) {
  const [tab, setTab] = useState<FeedTab>('text');
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [state, setState] = useState<FeedState>('idle');
  const [result, setResult] = useState<FeedResult | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseId = useId();
  const getTabId = (key: FeedTab) => `${baseId}-tab-${key}`;
  const getPanelId = (key: FeedTab) => `${baseId}-panel-${key}`;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    setState('uploading');

    // 构建请求体，基于来源类型匹配 /api/seed POST 接口
    let body: Record<string, unknown>;
    if (tab === 'screenshot') {
      body = {
        sourceType: 'image' as const,
        content: previewUrl ? { imagePreview: previewUrl } : {},
      };
    } else if (tab === 'link') {
      body = { sourceType: 'link' as const, sourceUrl: linkInput };
    } else {
      body = { sourceType: 'text' as const, content: { text: textInput } };
    }

    // 尝试调用真实 API，失败时退回 mock 流程
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setState('analyzing');
        await new Promise((r) => setTimeout(r, 1000));
        setState('classified');
        setResult(MOCK_RESULT);
        await new Promise((r) => setTimeout(r, 400));
        setState('saved');
        return;
      }
    } catch {
      // API 未就绪，回退到 mock 流程
    }

    // Mock 回退
    await new Promise((r) => setTimeout(r, 600));
    setState('analyzing');
    await new Promise((r) => setTimeout(r, 1000));
    setState('classified');
    setResult(MOCK_RESULT);
    await new Promise((r) => setTimeout(r, 400));
    setState('saved');
  };

  const handleClose = () => {
    setState('idle');
    setResult(null);
    setTextInput('');
    setLinkInput('');
    clearSelectedFile();
    onClose();
  };

  const tabs: { key: FeedTab; label: string; icon: string }[] = [
    { key: 'screenshot', label: '上传截图', icon: '📸' },
    { key: 'link', label: '粘贴链接', icon: '🔗' },
    { key: 'text', label: '输入文字', icon: '✏️' },
  ];

  return (
    <Modal open={open} onClose={handleClose} title="投喂新灵感 🌱">
      {/* CSS 自定义属性 —— 统一注入 COLORS，供 Tailwind 任意值引用 */}
      <div
        style={
          {
            '--color-mistPink': COLORS.mistPink,
            '--color-warmBrown': COLORS.warmBrown,
            '--color-deepBrown': COLORS.deepBrown,
            '--color-gold': COLORS.gold,
            '--color-coral': COLORS.coral,
            '--color-textPrimary': COLORS.textPrimary,
          } as React.CSSProperties
        }
      >
        {/* 无障碍状态播报：屏幕阅读器会在此区域变化时自动朗读 */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {state === 'uploading' && '正在上传灵感'}
          {state === 'analyzing' && '正在分析灵感'}
          {state === 'classified' && '识别完成，正在种入花园'}
          {state === 'saved' && '灵感已保存'}
        </div>

        {state === 'idle' && (
          <>
            {/* Tab 切换 —— 完整 WAI-ARIA Tab 模式 */}
            <div role="tablist" aria-label="投喂方式" className="flex gap-2 mb-4">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  id={getTabId(t.key)}
                  aria-selected={tab === t.key}
                  aria-controls={getPanelId(t.key)}
                  tabIndex={tab === t.key ? 0 : -1}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-all ${
                    tab === t.key
                      ? 'font-medium bg-[var(--color-mistPink)] text-[var(--color-textPrimary)]'
                      : 'text-[var(--color-deepBrown)] hover:bg-[var(--color-mistPink)] hover:bg-opacity-30'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* 截图上传面板 */}
            {tab === 'screenshot' && (
              <div
                role="tabpanel"
                id={getPanelId('screenshot')}
                aria-labelledby={getTabId('screenshot')}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-hidden="true"
                />
                {previewUrl ? (
                  <div className="border-2 border-dashed rounded-xl p-4 text-center text-sm border-[var(--color-gold)] border-opacity-50">
                    <img
                      src={previewUrl}
                      alt={selectedFile?.name ?? '截图预览'}
                      className="max-h-40 mx-auto rounded-lg mb-2 object-contain"
                    />
                    <p className="text-xs text-[var(--color-deepBrown)] mb-2 truncate">
                      {selectedFile?.name}
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 text-xs rounded-full border border-[var(--color-warmBrown)] border-opacity-30 text-[var(--color-textPrimary)] hover:bg-[var(--color-mistPink)] hover:bg-opacity-30 transition-colors"
                      >
                        重新选择
                      </button>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="px-3 py-1 text-xs rounded-full border border-[var(--color-warmBrown)] border-opacity-30 text-[var(--color-coral)] hover:bg-[var(--color-mistPink)] hover:bg-opacity-30 transition-colors"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="点击或拖拽上传截图"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className="border-2 border-dashed rounded-xl p-8 text-center text-sm cursor-pointer transition-colors border-[var(--color-warmBrown)] border-opacity-30 text-[var(--color-deepBrown)] hover:border-[var(--color-gold)] hover:border-opacity-50"
                  >
                    📸 点击或拖拽上传截图
                  </div>
                )}
              </div>
            )}

            {/* 链接输入面板 */}
            {tab === 'link' && (
              <div
                role="tabpanel"
                id={getPanelId('link')}
                aria-labelledby={getTabId('link')}
              >
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="粘贴链接..."
                  className="w-full px-4 py-3 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-opacity-50 text-[var(--color-textPrimary)] border-[var(--color-warmBrown)] border-opacity-30 placeholder-[var(--color-deepBrown)] placeholder-opacity-50"
                />
              </div>
            )}

            {/* 文字输入面板 */}
            {tab === 'text' && (
              <div
                role="tabpanel"
                id={getPanelId('text')}
                aria-labelledby={getTabId('text')}
              >
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="写下你想收藏的灵感..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-opacity-50 text-[var(--color-textPrimary)] border-[var(--color-warmBrown)] border-opacity-30 placeholder-[var(--color-deepBrown)] placeholder-opacity-50 resize-none"
                />
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                }}
              >
                种下灵感 ✦
              </button>
            </div>
          </>
        )}

        {/* 识别结果 */}
        {state === 'saved' && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-base font-medium text-[var(--color-textPrimary)] mb-1">
              我帮你种好啦
            </p>
            <p className="text-sm text-[var(--color-deepBrown)] mb-3">
              这条灵感已种进：{result.gardenType} &gt; {result.topicName}
            </p>
            <div className="flex justify-center gap-2 mb-3">
              {result.tags.map((tag) => (
                <span key={tag} className="capsule-tag">{tag}</span>
              ))}
            </div>
            {result.missingFields.length > 0 && (
              <p className="text-xs text-[var(--color-deepBrown)] mb-4">
                缺失信息：{result.missingFields.join('、')}
              </p>
            )}
            <div className="flex justify-center gap-3">
              <button className="px-4 py-2 text-sm rounded-full border border-[var(--color-warmBrown)] border-opacity-30 text-[var(--color-textPrimary)] hover:bg-[var(--color-mistPink)] hover:bg-opacity-30 transition-colors">
                补充信息
              </button>
              <button className="px-4 py-2 text-sm rounded-full border border-[var(--color-warmBrown)] border-opacity-30 text-[var(--color-textPrimary)] hover:bg-[var(--color-mistPink)] hover:bg-opacity-30 transition-colors">
                查看这株植物
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm rounded-full text-white"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                }}
              >
                继续投喂
              </button>
            </div>
          </motion.div>
        )}

        {/* 加载中 */}
        {(state === 'uploading' || state === 'analyzing' || state === 'classified') && (
          <div className="flex flex-col items-center py-8">
            <div className="text-3xl animate-bounce mb-3">🌱</div>
            <p className="text-sm text-[var(--color-deepBrown)]">
              {state === 'uploading' && '正在上传...'}
              {state === 'analyzing' && '正在分析灵感...'}
              {state === 'classified' && '识别完成，正在种入花园...'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
