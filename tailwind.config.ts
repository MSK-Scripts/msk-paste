import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        msk: {
          bg:       '#1b1b1d',
          surface:  '#242526',
          surface2: '#2a2b2e',
          border:   '#3d3d3f',
          accent:   '#5eb131',
          hover:    '#4e9827',
          text:     '#e3e3e3',
          muted:    '#8d9096',
          dim:      '#5c6370',
          danger:   '#e05c4b',
        },
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)',     'system-ui', 'sans-serif'],
        heading: ['var(--font-syne)',        'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)',   'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
