import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',  // ← à ajouter ici
  theme: {
    extend: {
      colors: {
        'night-blue': {
          50: '#eef7ff',
          100: '#d9ecff',
          500: '#2563eb',
          700: '#1d4ed8',
          900: '#1e293b',
        },
        white: '#ffffff',
        black: '#000000',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 20px 40px -10px rgba(59, 130, 246, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],  // ← remplace require par la variable importée

};

export default config;