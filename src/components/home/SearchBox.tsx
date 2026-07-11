// src/components/home/SearchBox.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

export function SearchBox() {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (!query.trim()) return;
    alert(`Mock 问问花园: "${query}"\n\n🌿 搜索结果：\n- 你在旅行花园有 3 个相关收藏\n- 美食花园有 1 个相关收藏`);
  };

  return (
    <>
      <style>{`
        .search-box-input::placeholder { color: ${COLORS.deepBrown}80; }
        .search-box-input:focus {
          box-shadow: 0 0 0 2px ${COLORS.gold}80;
          outline: none;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-16 left-6 z-10 flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="问问你的花园，比如：我之前存过哪些东京酒店？"
          className="search-box-input w-96 px-5 py-3 bg-white/60 backdrop-blur-sm border rounded-full text-sm"
          style={{
            borderColor: `${COLORS.warmBrown}33`,
            color: COLORS.textPrimary,
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSearch}
          className="px-5 py-3 text-sm font-medium text-white rounded-full"
          style={{ background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)` }}
        >
          开始提问 ✦
        </motion.button>
      </motion.div>
    </>
  );
}
