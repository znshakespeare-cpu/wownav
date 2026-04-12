/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'void-dark': '#0a0a0f',
        'void-mid': '#111118',
        'gold-dim': 'rgba(245,166,35,0.15)',
      },
      keyframes: {
        'panel-fade': {
          '0%': { opacity: '0.75', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'panel-fade': 'panel-fade 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
