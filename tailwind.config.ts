import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-sans-sc)', 'sans-serif'],
      },
      screens: {
        xs: '320px', // iPhone SE (最小支持设备)
        sm: '375px', // iPhone 12/13 Mini
        md: '390px', // iPhone 14 Pro (标准尺寸)
        lg: '414px', // iPhone 14 Pro Max
        xl: '428px', // iPhone 14 Plus (最大移动端)
        tablet: '768px', // iPad Mini
        desktop: '1024px', // Desktop
        laptop: '1280px', // 常规笔记本 / iPad 横屏以上的稳态布局
        'laptop-lg': '1366px', // 常见 13-14 寸笔记本
        display: '1440px', // 常规外接显示器
        wide: '1536px', // 2K / 大屏桌面
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        page: {
          DEFAULT: 'hsl(var(--page-bg))',
          elevated: 'hsl(var(--page-bg-elevated))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface-default))',
          muted: 'hsl(var(--surface-muted))',
          subtle: 'hsl(var(--surface-subtle))',
          selected: 'hsl(var(--surface-selected))',
          inverse: 'hsl(var(--surface-inverse))',
        },
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          tertiary: 'hsl(var(--text-tertiary))',
          disabled: 'hsl(var(--text-disabled))',
          inverse: 'hsl(var(--text-inverse))',
        },
        borderTone: {
          subtle: 'hsl(var(--border-subtle))',
          DEFAULT: 'hsl(var(--border-default))',
          strong: 'hsl(var(--border-strong))',
        },
        state: {
          success: {
            bg: 'hsl(var(--state-success-bg))',
            fg: 'hsl(var(--state-success-fg))',
          },
          warning: {
            bg: 'hsl(var(--state-warning-bg))',
            fg: 'hsl(var(--state-warning-fg))',
          },
          danger: {
            bg: 'hsl(var(--state-danger-bg))',
            fg: 'hsl(var(--state-danger-fg))',
          },
          info: {
            bg: 'hsl(var(--state-info-bg))',
            fg: 'hsl(var(--state-info-fg))',
          },
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'background-light': '#F3F4F6',
        'background-dark': '#0B0E14',
        'surface-dark': '#151921',
        'sidebar-dark': '#11141A',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        aurora: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      boxShadow: {
        surface: 'var(--shadow-surface-sm)',
        'surface-md': 'var(--shadow-surface-md)',
        'surface-lg': 'var(--shadow-surface-lg)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px -5px rgba(34, 197, 94, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        aurora: 'aurora 10s linear infinite',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config

export default config
