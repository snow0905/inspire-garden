// src/components/seed/ImageViewer.tsx
'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { COLORS } from '@/lib/constants';

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export function ImageViewer({ open, onClose, imageUrl, title }: ImageViewerProps) {
  const [zoomed, setZoomed] = useState(false);

  const toggleZoom = useCallback(() => setZoomed((z) => !z), []);

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="flex flex-col items-center gap-3">
        {/* 图片区域 */}
        <div
          className="relative w-full overflow-auto rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.03)',
            maxHeight: zoomed ? '80vh' : '70vh',
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
          }}
          onClick={toggleZoom}
          role="button"
          tabIndex={0}
          aria-label={zoomed ? '缩小图片' : '放大图片'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleZoom();
            }
          }}
        >
          <img
            src={imageUrl}
            alt={title || '原图'}
            className="transition-transform duration-300 select-none"
            style={{
              maxWidth: zoomed ? 'none' : '100%',
              maxHeight: zoomed ? 'none' : '70vh',
              objectFit: zoomed ? 'none' : 'contain',
              transform: zoomed ? undefined : 'scale(1)',
              cursor: zoomed ? 'zoom-out' : 'zoom-in',
            }}
            draggable={false}
          />
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between w-full">
          {title && (
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
              {title}
            </p>
          )}
          <p className="text-xs ml-auto" style={{ color: COLORS.deepBrown, opacity: 0.6 }}>
            点击图片{zoomed ? '缩小' : '查看原图'} · 按 Esc 关闭
          </p>
        </div>
      </div>
    </Modal>
  );
}
