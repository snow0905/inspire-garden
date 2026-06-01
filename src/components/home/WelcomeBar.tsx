// src/components/home/WelcomeBar.tsx
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface WelcomeBarProps {
  title: string;
  keywords: string[];
}

export function WelcomeBar({ title, keywords }: WelcomeBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-6 z-10"
    >
      <h2 className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>{title}</h2>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-sm" style={{ color: COLORS.deepBrown }}>我发现你最近经常种下：</span>
        {keywords.map((kw) => (
          <span key={kw} className="capsule-tag">{kw}</span>
        ))}
      </div>
    </motion.div>
  );
}
