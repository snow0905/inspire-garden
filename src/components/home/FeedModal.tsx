// src/components/home/FeedModal.tsx
'use client';

import { useState, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { COLORS, GARDEN_CONFIG } from '@/lib/constants';
import { PlantAvatar } from '@/components/garden/PlantAvatar';
import type { GrowthNarrative, PlantFamily, PlantStage } from '@/types';

type FeedTab = 'screenshot' | 'link' | 'text';
type FeedState = 'idle' | 'uploading' | 'analyzing' | 'classified' | 'saved' | 'error';

interface FeedResult {
  gardenType: string;
  topicName: string;
  tags: string[];
  missingFields: string[];
  extractedText?: string;
  title?: string;
  summary?: string;
  extractedFields?: Record<string, string>;
  branch?: string;
}

/** File → base64 data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

interface FeedModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedModal({ open, onClose }: FeedModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<FeedTab>('text');
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [state, setState] = useState<FeedState>('idle');
  const [result, setResult] = useState<FeedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedTopicId, setSavedTopicId] = useState<string | null>(null);
  const [savedSeedId, setSavedSeedId] = useState<string | null>(null);
  const [growthNarrative, setGrowthNarrative] = useState<GrowthNarrative | null>(null);
  const [savedTopic, setSavedTopic] = useState<{
    plant_family: PlantFamily;
    stage: PlantStage;
    growth_score: number;
  } | null>(null);
  const [isWateringOpen, setIsWateringOpen] = useState(false);
  const [wateringValues, setWateringValues] = useState<Record<string, string>>({});
  const [wateringStatus, setWateringStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

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
    setErrorMsg('');

    try {
      // 1. 准备分类请求
      let classifyBody: Record<string, unknown>;

      if (tab === 'screenshot') {
        if (!selectedFile) {
          setErrorMsg('请先选择一张截图');
          setState('idle');
          return;
        }
        // 上传图片到存储，获取 imageUrl
        const uploadForm = new FormData();
        uploadForm.append('file', selectedFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        });
        if (!uploadRes.ok) {
          throw new Error('图片上传失败');
        }
        const { imageUrl } = await uploadRes.json();
        // 同时传 dataUrl 给分类 API 做 OCR
        const dataUrl = await fileToDataUrl(selectedFile);
        classifyBody = { type: 'image', dataUrl };
        // 保存 imageUrl 用于后续种子创建
        (classifyBody as Record<string, unknown>)._imageUrl = imageUrl;
      } else if (tab === 'link') {
        if (!linkInput.trim()) {
          setErrorMsg('请先粘贴链接');
          setState('idle');
          return;
        }
        classifyBody = { type: 'link', textContent: linkInput.trim() };
      } else {
        if (!textInput.trim()) {
          setErrorMsg('请先输入文字');
          setState('idle');
          return;
        }
        classifyBody = { type: 'text', textContent: textInput.trim() };
      }

      // 2. 调用 AI 分类
      setState('analyzing');
      const classifyRes = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classifyBody),
      });

      if (!classifyRes.ok) {
        const errData = await classifyRes.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || `分类失败 (${classifyRes.status})`);
      }

      const classifyResult: FeedResult = await classifyRes.json();

      // 3. 显示分类结果 → 保存种子
      setState('classified');
      setResult(classifyResult);

      // 保存种子到数据库（带 topicName 自动创建/关联主题）
      const seedBody: Record<string, unknown> = {
        gardenType: classifyResult.gardenType,
        topicName: classifyResult.topicName,
        tags: classifyResult.tags,
        title: classifyResult.title,
        summary: classifyResult.summary,
        extractedFields: classifyResult.extractedFields,
        missingFields: classifyResult.missingFields,
        branch: classifyResult.branch,
      };
      if (tab === 'screenshot') {
        seedBody.sourceType = 'image';
        seedBody.content = { ocrText: classifyResult.extractedText };
        // 传递已上传的图片 URL
        const imageUrl = (classifyBody as Record<string, unknown>)._imageUrl as string | undefined;
        if (imageUrl) seedBody.imageUrl = imageUrl;
      } else if (tab === 'link') {
        seedBody.sourceType = 'link';
        seedBody.sourceUrl = linkInput.trim();
      } else {
        seedBody.sourceType = 'text';
        seedBody.content = { text: textInput.trim() };
      }

      const seedRes = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seedBody),
      });
      const savedSeed = await seedRes.json();
      console.log('🔍 [投喂] /api/seed 响应:', {
        ok: seedRes.ok,
        status: seedRes.status,
        hasSeed: !!savedSeed.seed,
        seedId: savedSeed.seed?.id,
        hasTopic: !!savedSeed.topic,
        topicId: savedSeed.topicId,
        fullResponse: savedSeed,
      });

      if (!seedRes.ok) {
        console.error('🔍 [投喂] /api/seed 返回错误:', savedSeed.error || seedRes.statusText);
        throw new Error((savedSeed as { error?: string }).error || `保存种子失败 (${seedRes.status})`);
      }

      if (savedSeed.topicId) setSavedTopicId(savedSeed.topicId);
      if (savedSeed.seed?.id) {
        setSavedSeedId(savedSeed.seed.id);
        console.log('🔍 [投喂] savedSeedId 已设置:', savedSeed.seed.id);
      } else {
        console.warn('🔍 [投喂] savedSeed.seed?.id 为空，savedSeedId 未设置');
      }
      if (savedSeed.growthNarrative) {
        setGrowthNarrative(savedSeed.growthNarrative as GrowthNarrative);
      }
      if (savedSeed.topic) {
        setSavedTopic({
          plant_family: savedSeed.topic.plant_family,
          stage: savedSeed.topic.stage,
          growth_score: savedSeed.topic.growth_score,
        });
      }

      await new Promise((r) => setTimeout(r, 400));
      setState('saved');
    } catch (err) {
      console.error('Feed error:', err);
      setErrorMsg(err instanceof Error ? err.message : '提交失败，请重试');
      setState('error');
    }
  };

  const handleWateringSave = async () => {
    console.log('🔍 [补水] handleWateringSave 触发', {
      savedSeedId,
      wateringValues,
      isWateringOpen,
    });

    if (!savedSeedId) {
      console.warn('🔍 [补水] 保存失败：savedSeedId 为空，请检查种子是否成功创建');
      setWateringStatus('error');
      return;
    }

    const filled = Object.fromEntries(
      Object.entries(wateringValues).filter(([, v]) => v.trim())
    );
    console.log('🔍 [补水] 有效字段:', filled, '数量:', Object.keys(filled).length);

    if (Object.keys(filled).length === 0) {
      console.log('🔍 [补水] 没有填写任何字段，收起面板');
      setIsWateringOpen(false);
      return;
    }

    setWateringStatus('saving');
    console.log('🔍 [补水] 开始发送 PATCH 请求...');

    try {
      const body = JSON.stringify({ extracted_fields: filled });
      console.log('🔍 [补水] 请求体:', body);
      const patchRes = await fetch(`/api/seed/${savedSeedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const patchData = await patchRes.json();
      console.log('🔍 [补水] PATCH 响应:', { status: patchRes.status, ok: patchRes.ok, data: patchData });

      if (patchRes.ok) {
        console.log('🔍 [补水] 保存成功，更新前端状态');
        if (patchData.growthNarrative) {
          setGrowthNarrative(patchData.growthNarrative as GrowthNarrative);
        }
        if (patchData.topic) {
          setSavedTopic({
            plant_family: patchData.topic.plant_family,
            stage: patchData.topic.stage,
            growth_score: patchData.topic.growth_score,
          });
        }
        const filledKeys = Object.keys(filled);
        setResult((prev) =>
          prev
            ? {
                ...prev,
                missingFields: prev.missingFields.filter((f) => !filledKeys.includes(f)),
                extractedFields: { ...(prev.extractedFields ?? {}), ...filled },
              }
            : prev
        );
        setWateringValues({});
        setWateringStatus('success');
        setIsWateringOpen(false);
        setTimeout(() => setWateringStatus('idle'), 4000);
      } else {
        console.error('🔍 [补水] API 返回错误:', patchData.error || patchRes.statusText);
        setWateringStatus('error');
      }
    } catch (err) {
      console.error('🔍 [补水] 网络异常:', err);
      setWateringStatus('error');
    }
  };

  const handleClose = () => {
    setState('idle');
    setResult(null);
    setErrorMsg('');
    setSavedTopicId(null);
    setSavedSeedId(null);
    setGrowthNarrative(null);
    setSavedTopic(null);
    setIsWateringOpen(false);
    setWateringValues({});
    setWateringStatus('idle');
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
    <Modal
      open={open}
      onClose={handleClose}
      title={state === 'saved' ? undefined : '投喂新灵感 🌱'}
      size={state === 'saved' ? 'lg' : 'lg'}
    >
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

        {/* ===== 保存成功：梦幻结果卡 ===== */}
        {state === 'saved' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex flex-col gap-4 py-2 px-0"
          >
            {/* ── 装饰花瓣背景粒子 ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[36px]">
              {/* 左上花瓣 */}
              <motion.span
                className="absolute text-base opacity-30"
                style={{ top: '8%', left: '6%' }}
                animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >🌸</motion.span>
              {/* 右上星光 */}
              <motion.span
                className="absolute text-sm opacity-25"
                style={{ top: '10%', right: '8%' }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
              >✨</motion.span>
              {/* 左下小叶 */}
              <motion.span
                className="absolute text-base opacity-25"
                style={{ bottom: '15%', left: '8%' }}
                animate={{ y: [0, -4, 0], rotate: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}
              >🍃</motion.span>
              {/* 右下小花 */}
              <motion.span
                className="absolute text-sm opacity-25"
                style={{ bottom: '12%', right: '10%' }}
                animate={{ opacity: [0.15, 0.4, 0.15] }}
                transition={{ repeat: Infinity, duration: 4.5, delay: 1.5 }}
              >🌼</motion.span>
              {/* 顶部中央小星光 */}
              <motion.span
                className="absolute text-xs opacity-20"
                style={{ top: '18%', left: '48%' }}
                animate={{ opacity: [0.1, 0.35, 0.1], scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2.8, delay: 2 }}
              >✦</motion.span>
            </div>

            {/* ════════════════════════════════════════
                Section 1 — 成功标题区
               ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55, ease: 'easeOut' }}
              className="text-center relative"
            >
              <div className="inline-flex items-center gap-2 mb-2">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 8, 0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
                >🪷</motion.span>
                <h1
                  className="text-[32px] font-semibold tracking-tight leading-tight"
                  style={{
                    color: '#5a6b3c',
                    fontFamily: "'Georgia', 'Noto Serif SC', 'STSong', serif",
                  }}
                >
                  种好啦！
                </h1>
                <motion.span
                  className="text-2xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.8 }}
                >🌱</motion.span>
              </div>
              <p
                className="text-[15px] tracking-wide"
                style={{ color: '#8a7a62' }}
              >
                小园丁已经帮你把这条灵感种进花园啦
              </p>
            </motion.div>

            {/* ════════════════════════════════════════
                Section 2 — 已种进位置区
               ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.5, ease: 'easeOut' }}
              className="relative rounded-[24px] px-4 py-3 flex items-center gap-3 overflow-hidden"
              style={{
                background: 'rgba(255, 250, 240, 0.48)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(217, 178, 153, 0.18)',
                boxShadow: '0 2px 20px rgba(148, 116, 83, 0.06)',
              }}
            >
              {/* 植物插画 */}
              <div className="flex-shrink-0">
                <PlantAvatar
                  plantFamily={savedTopic?.plant_family ?? 'tree'}
                  stage={savedTopic?.stage ?? 'seed'}
                  size={80}
                />
              </div>

              {/* 位置信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-wider mb-1.5" style={{ color: '#947453', opacity: 0.7 }}>
                  已种进
                </p>
                <p className="text-base font-medium leading-snug" style={{ color: COLORS.textPrimary }}>
                  <span>
                    {GARDEN_CONFIG[result.gardenType as keyof typeof GARDEN_CONFIG]?.name ?? result.gardenType}
                  </span>
                  <span className="mx-2 inline-block opacity-40" style={{ color: COLORS.warmBrown }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block -mt-0.5">
                      <path d="M6 3 Q8 8 12 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                      <path d="M12 4 L12 3 L13 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.4" />
                    </svg>
                  </span>
                  <span>{result.topicName}</span>
                </p>
                {(result.branch || growthNarrative?.addedBranch) && (
                  <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: '#947453', opacity: 0.8 }}>
                    这条灵感让「{result.topicName}」长出了一片
                    <span className="font-medium" style={{ color: COLORS.textPrimary }}>
                      「{result.branch || growthNarrative?.addedBranch}」
                    </span>
                    新叶 🍃
                  </p>
                )}
                {!result.branch && !growthNarrative?.addedBranch && (
                  <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: '#947453', opacity: 0.8 }}>
                    这条灵感已种入「{result.topicName}」，正在静静生长 🌱
                  </p>
                )}
              </div>

              {/* 右边缘轻装饰 */}
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
                  <circle cx="30" cy="15" r="6" fill={COLORS.gold} />
                  <circle cx="35" cy="40" r="4" fill={COLORS.mistPink} />
                  <circle cx="28" cy="62" r="5" fill={COLORS.gold} />
                </svg>
              </div>
            </motion.div>

            {/* ════════════════════════════════════════
                Section 3 — AI 识别结果区
               ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.5, ease: 'easeOut' }}
              className="rounded-[24px] px-4 py-3"
              style={{
                background: 'rgba(255, 255, 255, 0.52)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(217, 178, 153, 0.15)',
                boxShadow: '0 2px 16px rgba(148, 116, 83, 0.04)',
              }}
            >
              <p className="text-sm font-medium mb-3 flex items-center gap-1.5" style={{ color: COLORS.textPrimary }}>
                <span>AI 识别到</span>
                <motion.span
                  className="text-sm inline-block"
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                >✨</motion.span>
              </p>

              <div className="flex gap-4 sm:flex-row flex-col">
                {/* 左侧：图片缩略图 */}
                {previewUrl && (
                  <div className="flex-shrink-0 sm:w-[140px] w-full">
                    <div
                      className="relative rounded-[18px] overflow-hidden aspect-[4/3]"
                      style={{
                        boxShadow: '0 4px 18px rgba(148, 116, 83, 0.1), 0 0 0 1px rgba(217, 178, 153, 0.12)',
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt={result.title || '上传图片'}
                        className="w-full h-full object-cover"
                      />
                      {/* 柔光叠加 */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,250,240,0.25) 0%, transparent 60%)',
                        }}
                      />
                      {/* 左上角图片标记 */}
                      <div
                        className="absolute top-2 left-2 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.7)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        🖼️
                      </div>
                    </div>
                  </div>
                )}

                {/* 右侧：AI 识别文本 */}
                <div className={`flex-1 min-w-0 ${previewUrl ? '' : 'sm:ml-0'}`}>
                  {/* AI 标题 */}
                  <p
                    className="text-base font-medium mb-1.5 leading-snug"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {result.title || result.topicName}
                  </p>

                  {/* AI 摘要 */}
                  {(result.summary || result.extractedText) && (
                    <p
                      className="text-[14px] leading-relaxed mb-3 line-clamp-2"
                      style={{ color: '#947453' }}
                    >
                      {result.summary || result.extractedText}
                    </p>
                  )}

                  {/* 标签胶囊 */}
                  {result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, i) => {
                        // 软色标签：轮流使用浅粉、奶油杏、浅绿
                        const tagColors = [
                          { bg: 'rgba(242, 228, 218, 0.55)', text: COLORS.textPrimary },
                          { bg: 'rgba(229, 200, 114, 0.2)', text: '#6b5b3e' },
                          { bg: 'rgba(196, 212, 184, 0.35)', text: '#4a5e3a' },
                          { bg: 'rgba(242, 210, 205, 0.4)', text: '#7a4a48' },
                          { bg: 'rgba(214, 200, 180, 0.4)', text: '#5e5040' },
                        ];
                        const c = tagColors[i % tagColors.length];
                        return (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs rounded-full"
                            style={{
                              background: c.bg,
                              color: c.text,
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(217, 178, 153, 0.12)',
                            }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ════════════════════════════════════════
                Section 4 — 还缺一些信息区（含补水展开）
               ════════════════════════════════════════ */}
            {result.missingFields && result.missingFields.length > 0 && (
              <>
                {/* ── 头部卡片：标题 + 缺失胶囊 ── */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.5, ease: 'easeOut' }}
                  className="rounded-[24px] px-4 py-3"
                  style={{
                    background: 'rgba(255, 248, 240, 0.45)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(200, 190, 175, 0.15)',
                  }}
                >
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: COLORS.textPrimary }}>
                    <span>还缺一些信息</span>
                    <motion.span
                      className="text-sm inline-block"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                    >💧</motion.span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingFields.map((field) => (
                      <span
                        key={field}
                        className="px-3 py-1 text-xs rounded-full"
                        style={{
                          background: wateringValues[field]?.trim()
                            ? 'rgba(196, 212, 184, 0.4)'
                            : 'rgba(228, 210, 195, 0.45)',
                          color: wateringValues[field]?.trim() ? '#4a5e3a' : '#7a6548',
                          border: wateringValues[field]?.trim()
                            ? '1px solid rgba(140, 170, 130, 0.3)'
                            : '1px dashed rgba(180, 155, 130, 0.25)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {field}
                      </span>
                    ))}
                  </div>

                </motion.div>

                {/* ── 补水输入区（在 motion.div 外部，避免事件拦截）── */}
                {isWateringOpen && (
                  <div
                    className="rounded-[20px] px-3.5 py-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.55)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(217, 178, 153, 0.12)',
                      animation: 'fadeIn 0.3s ease-out',
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      {result.missingFields.map((field) => (
                        <div key={field}>
                          <label
                            className="block text-[13px] font-medium mb-1.5"
                            style={{ color: COLORS.textPrimary }}
                          >
                            {field}
                          </label>
                          <input
                            type="text"
                            value={wateringValues[field] || ''}
                            onChange={(e) =>
                              setWateringValues((prev) => ({
                                ...prev,
                                [field]: e.target.value,
                              }))
                            }
                            placeholder={
                              field === '预算' ? '例如 800–1200 元/晚' :
                              field === '出行日期' ? '例如 2026 年 3 月 / 春节前后' :
                              field === '具体酒店名称' || field === '店名' ? '例如 新宿 XX 酒店' :
                              field === '地点' ? '例如 东京·新宿' :
                              field === '时间' ? '例如 3 天 2 晚 / 还没定' :
                              `补充${field}…`
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                            style={{
                              background: 'rgba(250, 246, 240, 0.65)',
                              border: '1px solid rgba(200, 180, 155, 0.25)',
                              color: COLORS.textPrimary,
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(229, 200, 114, 0.5)';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229, 200, 114, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(200, 180, 155, 0.25)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* 补水内联反馈 */}
                    {wateringStatus === 'error' && (
                      <div
                        className="flex items-center gap-2 text-[13px] mt-3 px-1"
                        style={{ color: COLORS.coral, animation: 'fadeIn 0.3s ease-out' }}
                      >
                        <span>😥</span>
                        <span>
                          {!savedSeedId
                            ? '种子 ID 丢失，请关闭弹窗后重新投喂。'
                            : '保存失败，请检查网络后重试。'}
                        </span>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex justify-end gap-2.5 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🔍 [补水] 点击「收起」按钮');
                          setIsWateringOpen(false);
                          setWateringStatus('idle');
                        }}
                        className="px-4 py-2 text-sm rounded-full border transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          color: COLORS.textPrimary,
                          borderColor: 'rgba(217, 178, 153, 0.3)',
                        }}
                      >
                        收起
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🔍 [补水] 点击「保存补水」按钮');
                          handleWateringSave();
                        }}
                        disabled={wateringStatus === 'saving'}
                        className="px-4 py-2 text-sm rounded-full text-white transition-all hover:translate-y-[-1px] hover:shadow-md disabled:opacity-60"
                        style={{
                          background: wateringStatus === 'error'
                            ? `linear-gradient(135deg, ${COLORS.coral} 0%, #e08070 100%)`
                            : `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                        }}
                      >
                        {wateringStatus === 'saving' ? '保存中...' : wateringStatus === 'error' ? '重试保存' : '保存补水'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── 补水反馈 ── */}
                {wateringStatus === 'success' && !isWateringOpen && (
                  <div
                    className="flex items-center gap-2 text-[13px] px-1"
                    style={{ color: '#6b8b6b', animation: 'fadeIn 0.4s ease-out' }}
                  >
                    <span>💧</span>
                    <span>
                      补水成功！这条灵感的信息更完整了，「{result.topicName}」离开花又近了一点。
                    </span>
                  </div>
                )}
                {wateringStatus === 'error' && !isWateringOpen && (
                  <div
                    className="flex items-center gap-2 text-[13px] px-1"
                    style={{ color: COLORS.coral, animation: 'fadeIn 0.4s ease-out' }}
                  >
                    <span>😥</span>
                    <span>补水遇到小问题，请稍后再试。</span>
                  </div>
                )}
              </>
            )}

            {/* ════════════════════════════════════════
                Section 5 — 轻量成长反馈区
               ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.40, duration: 0.5, ease: 'easeOut' }}
              className="relative rounded-[20px] px-3.5 py-2.5 flex items-center gap-2.5 overflow-hidden"
              style={{
                background: 'rgba(255, 252, 247, 0.55)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(229, 200, 114, 0.15)',
                boxShadow: '0 1px 10px rgba(148, 116, 83, 0.03)',
              }}
            >
              <span className="flex-shrink-0 text-lg opacity-60">🍃</span>
              <p className="text-[13px] leading-relaxed flex-1" style={{ color: '#806b52' }}>
                {(() => {
                  const topicName = result.topicName;
                  const branch = result.branch || growthNarrative?.addedBranch;
                  const stage = savedTopic?.stage ?? 'seed';
                  if (branch) {
                    return `这条灵感让「${topicName}」长出了一片「${branch}」新叶🍃，等信息更完整后就能开花啦。`;
                  }
                  if (stage === 'bloom' || stage === 'fruit') {
                    return `「${topicName}」已经${stage === 'bloom' ? '开花' : '结果'}啦🌸，可以采摘为行动清单了！`;
                  }
                  return `这条灵感让「${topicName}」又长大了一点🌱，继续补充信息可以让它更快开花。`;
                })()}
              </p>
              <div className="absolute -right-1 -bottom-1 opacity-8 pointer-events-none">
                <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
                  <ellipse cx="30" cy="6" rx="8" ry="5" fill={COLORS.mistPink} opacity="0.3" transform="rotate(20 30 6)" />
                  <ellipse cx="26" cy="18" rx="6" ry="4" fill={COLORS.gold} opacity="0.2" transform="rotate(-15 26 18)" />
                </svg>
              </div>
            </motion.div>

            {/* ════════════════════════════════════════
                Section 6 — 底部操作按钮区
               ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.5, ease: 'easeOut' }}
              className="flex justify-center items-center gap-3 flex-wrap pt-1"
            >
              {/* 补充信息按钮 */}
              {result.missingFields && result.missingFields.length > 0 && !isWateringOpen && wateringStatus !== 'success' && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('🔍 [补水] 点击底部「补充信息」按钮');
                    setIsWateringOpen(true);
                    setWateringStatus('idle');
                  }}
                  className="px-5 py-3 text-sm font-medium rounded-full border transition-all duration-300 hover:translate-y-[-2px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(6px)',
                    color: COLORS.textPrimary,
                    borderColor: 'rgba(217, 178, 153, 0.35)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(148, 116, 83, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  补充信息
                </button>
              )}

              {/* 主按钮：查看这株植物 */}
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  if (savedTopicId) {
                    router.push(`/garden/${result.gardenType}/${savedTopicId}`);
                  } else {
                    router.push(`/garden/${result.gardenType}`);
                  }
                }}
                className="px-6 py-3 text-sm font-medium text-white rounded-full transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, #f0c4c0 50%, ${COLORS.coral} 100%)`,
                  boxShadow: `0 6px 20px rgba(237, 114, 110, 0.2), 0 2px 6px rgba(237, 114, 110, 0.1)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 28px rgba(237, 114, 110, 0.28), 0 3px 10px rgba(237, 114, 110, 0.15)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 6px 20px rgba(237, 114, 110, 0.2), 0 2px 6px rgba(237, 114, 110, 0.1)`;
                }}
              >
                查看这株植物
              </button>

              {/* 次按钮：继续投喂 */}
              <button
                type="button"
                onClick={() => {
                  setState('idle');
                  setResult(null);
                  setSavedTopicId(null);
                  setSavedSeedId(null);
                  setGrowthNarrative(null);
                  setSavedTopic(null);
                  setIsWateringOpen(false);
                  setWateringValues({});
                  setWateringStatus('idle');
                  setTextInput('');
                  setLinkInput('');
                  clearSelectedFile();
                }}
                className="px-5 py-3 text-sm rounded-full border transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(6px)',
                  color: COLORS.textPrimary,
                  borderColor: 'rgba(217, 178, 153, 0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(148, 116, 83, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                继续投喂
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 错误状态 */}
        {state === 'error' && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="text-3xl mb-3">😥</div>
            <p className="text-sm text-[var(--color-coral)] mb-4">{errorMsg}</p>
            <button
              onClick={() => setState('idle')}
              className="px-5 py-2 text-sm rounded-full border border-[var(--color-warmBrown)] border-opacity-30 text-[var(--color-textPrimary)] hover:bg-[var(--color-mistPink)] hover:bg-opacity-30 transition-colors"
            >
              返回重试
            </button>
          </div>
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
