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
          primary: '#050507',
          secondary: '#0a0d14',
          tertiary: '#10141e',
        },
        neon: {
          blue: '#c7a05a',       // ← Gold (primary)
          pink: '#c0c0c0',       // ← Silver (secondary)
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
        display: ['var(--font-display)', 'Oswald', 'sans-serif'],
        body: ['var(--font-body)', 'Source Sans 3', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(199, 160, 90, 0.3), 0 0 30px rgba(199, 160, 90, 0.1)',
        'neon-pink': '0 0 15px rgba(192, 192, 192, 0.3), 0 0 30px rgba(192, 192, 192, 0.1)',
        'neon-blue-lg': '0 0 20px rgba(199, 160, 90, 0.4), 0 0 40px rgba(199, 160, 90, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(199, 160, 90, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(199, 160, 90, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'count-up': 'count-up 2s ease-out',
        'neon-sweep': 'neon-sweep 3s ease-in-out infinite',
        'neon-sweep-reverse': 'neon-sweep-reverse 4s ease-in-out infinite',
        'grid-pulse': 'grid-pulse 8s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 10px rgba(199, 160, 90, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(199, 160, 90, 0.4), 0 0 40px rgba(199, 160, 90, 0.1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'neon-sweep': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'neon-sweep-reverse': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
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
