import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'hsl(var(--surface-base))',
          raised: 'hsl(var(--surface-raised))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
        },
        content: {
          primary: 'hsl(var(--content-primary))',
          secondary: 'hsl(var(--content-secondary))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
        },
        threat: {
          benign: '#22c55e',
          brute: '#ef4444',
          recon: '#f97316',
          spoofing: '#a855f7',
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          info: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
