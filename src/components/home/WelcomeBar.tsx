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
      <h2 className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>{title}</h2>
    </motion.div>
  );
}
