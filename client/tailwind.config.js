/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── JanSamadhan Design System ───────────────────
        navy: {
          DEFAULT: '#12304A',
          deep:    '#0B1F33',
          600:     '#1a4060',
          700:     '#12304A',
          800:     '#0e2438',
          900:     '#0B1F33',
        },
        green: {
          DEFAULT:  '#16834A',
          light:    '#E8F5EC',
          50:       '#E8F5EC',
          100:      '#C6E6D1',
          400:      '#34C176',
          500:      '#16834A',
          600:      '#117A40',
          700:      '#0d6535',
        },
        civic: {
          bg:        '#F7F9F7',
          text:      '#172B20',
          secondary: '#647067',
          border:    '#E2E8E2',
          white:     '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':  '0 2px 16px 0 rgba(18,48,74,0.08)',
        'card-hover': '0 8px 32px 0 rgba(18,48,74,0.14)',
        'nav':   '0 1px 0 0 #E2E8E2',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
