import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF3DE',
          500: '#3B6D11',
          700: '#27500A',
        },
        accent: {
          50: '#FAEEDA',
          500: '#BA7517',
        },
      },
      boxShadow: {
        soft: '0 24px 70px rgba(17, 24, 39, 0.12)',
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;