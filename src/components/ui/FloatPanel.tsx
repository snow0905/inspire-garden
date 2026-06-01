// src/components/ui/FloatPanel.tsx
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface FloatPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  decoration?: boolean;
}

export function FloatPanel({ title, children, className = '', decoration = true }: FloatPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`float-panel p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        {decoration && <span className="text-sm">🌸</span>}
        <h3 className="text-sm font-semibold tracking-wide" style={{ color: COLORS.deepBrown }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
