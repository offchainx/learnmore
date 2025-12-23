import { Inter, Noto_Sans_SC } from 'next/font/google'

/**
 * 字体优化配置
 * 使用 Next.js 字体优化功能自动托管和优化字体
 */

// 英文字体: Inter
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 字体加载期间显示后备字体
  variable: '--font-inter',
  preload: true, // 预加载
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
})

// 中文字体: Noto Sans SC (思源黑体简体)
export const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  preload: true,
  fallback: [
    'PingFang SC',
    'Microsoft YaHei',
    'SimHei',
    'sans-serif',
  ],
})

/**
 * 字体类名
 * 在组件中使用: className={fonts.className}
 */
export const fonts = {
  className: `${inter.variable} ${notoSansSC.variable} font-sans`,
}

/**
 * CSS变量使用示例:
 *
 * .element {
 *   font-family: var(--font-inter);
 * }
 *
 * .chinese-text {
 *   font-family: var(--font-noto-sans-sc);
 * }
 */
