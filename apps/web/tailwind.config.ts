import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Orange Electric Primary — Lumono accent
        primary: {
          50: '#fff7e6',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF9900',
          600: '#ea8500',
          700: '#c2710a',
          800: '#9a5b0d',
          900: '#7c4a0e',
          950: '#432505',
        },
        // Muted functional colors (kept for form errors, movement types)
        success: {
          50: '#0d1f17',
          100: '#0f2a1e',
          200: '#143d2b',
          300: '#1a5c40',
          400: '#22805a',
          500: '#2d9d6f',
          600: '#3bb380',
          700: '#5cc99a',
          800: '#8cddb8',
          900: '#c4f0da',
          950: '#e5f9ee',
        },
        warning: {
          50: '#1f1a0d',
          100: '#2a230f',
          200: '#3d3414',
          300: '#5c4d1a',
          400: '#806b22',
          500: '#9d852d',
          600: '#b39a3b',
          700: '#c9b25c',
          800: '#ddcc8c',
          900: '#f0e5c4',
          950: '#f9f3e5',
        },
        danger: {
          50: '#1f0d0d',
          100: '#2a0f0f',
          200: '#3d1414',
          300: '#5c1a1a',
          400: '#802222',
          500: '#9d2d2d',
          600: '#b33b3b',
          700: '#c95c5c',
          800: '#dd8c8c',
          900: '#f0c4c4',
          950: '#f9e5e5',
        },
        info: {
          50: '#0d1520',
          100: '#0f1c2a',
          200: '#14293d',
          300: '#1a3e5c',
          400: '#225680',
          500: '#2d6e9d',
          600: '#3b85b3',
          700: '#5c9fc9',
          800: '#8cbcdd',
          900: '#c4daf0',
          950: '#e5eff9',
        },
        // Dark surface neutrals — inverted semantic scale
        surface: {
          50: '#111111',
          100: '#161616',
          200: '#1C1C1C',
          300: '#222222',
          400: '#333333',
          500: '#666666',
          600: '#888888',
          700: '#A0A0A0',
          800: '#CCCCCC',
          900: '#E8E8E8',
          950: '#F5F5F5',
        },
      },
      boxShadow: {
        'glow': '0 0 20px oklch(68% 0.19 55 / 0.15)',
        'glow-sm': '0 0 10px oklch(68% 0.19 55 / 0.10)',
        'glow-lg': '0 0 40px oklch(68% 0.19 55 / 0.20)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;
