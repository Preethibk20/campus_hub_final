import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2DB88B',
          dark: '#0D4F3C',
          light: '#E8F8F3'
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F8FAFC',
          3: '#F1F5F9'
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E0'
        },
        text: {
          primary: '#1A202C',
          secondary: '#4A5568',
          muted: '#718096'
        },
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6'
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        input: '8px',
        full: '9999px'
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}

export default config
