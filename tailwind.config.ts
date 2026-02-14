import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#111827',
          tertiary: '#1a1a2e',
        },
        neon: {
          blue: '#2cb2fe',
          pink: '#f554da',
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#888888',
          white: '#ffffff',
        },
        border: {
          subtle: '#1e293b',
        },
        status: {
          success: '#22c55e',
          danger: '#ef4444',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(44, 178, 254, 0.3), 0 0 30px rgba(44, 178, 254, 0.1)',
        'neon-pink': '0 0 15px rgba(245, 84, 218, 0.3), 0 0 30px rgba(245, 84, 218, 0.1)',
        'neon-blue-lg': '0 0 20px rgba(44, 178, 254, 0.4), 0 0 40px rgba(44, 178, 254, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(44, 178, 254, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 178, 254, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'count-up': 'count-up 2s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 10px rgba(44, 178, 254, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(44, 178, 254, 0.4), 0 0 40px rgba(44, 178, 254, 0.1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
