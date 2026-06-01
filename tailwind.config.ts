import type { Config } from 'tailwindcss';
import { COLORS } from './src/lib/constants';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: COLORS.cream,
        'mist-pink': COLORS.mistPink,
        'warm-brown': COLORS.warmBrown,
        'deep-brown': COLORS.deepBrown,
        gold: COLORS.gold,
        'dark-gold': COLORS.darkGold,
        coral: COLORS.coral,
        'text-primary': COLORS.textPrimary,
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        capsule: '9999px',
      },
    },
  },
  plugins: [],
};
export default config;
