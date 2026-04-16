/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // AI Purple — primary brand
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1c1c2e',
        },
        // Cyan — accent / interactions
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Legacy nexus alias for backward compat
        nexus: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1c1c2e',
        },
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
        'glow-sm':     '0 0 8px rgba(124,58,237,0.3)',
        'glow-md':     '0 0 16px rgba(124,58,237,0.4)',
        'glow-lg':     '0 0 32px rgba(124,58,237,0.5)',
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'fade-in':     'fadeIn 200ms ease-out',
        'slide-up':    'slideUp 200ms ease-out',
        'scale-in':    'scaleIn 150ms ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};