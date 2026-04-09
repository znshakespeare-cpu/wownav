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
    },
  },
  plugins: [],
};
