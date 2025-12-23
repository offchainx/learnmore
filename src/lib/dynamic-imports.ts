import dynamic from 'next/dynamic'

/**
 * 动态导入配置
 * 用于代码分割和懒加载
 */

// 社区组件 (非首屏关键)
export const DynamicCommunityView = dynamic(
  () => import('@/components/dashboard/CommunityView').then((mod) => ({ default: mod.CommunityView })),
  {
    ssr: false, // 禁用服务端渲染
  }
)

// 排行榜组件 (非首屏关键)
export const DynamicLeaderboardView = dynamic(
  () => import('@/components/dashboard/views/LeaderboardView').then((mod) => ({ default: mod.LeaderboardView })),
  {
    ssr: false,
  }
)

// 设置页面 (非首屏关键)
export const DynamicSettingsView = dynamic(
  () => import('@/components/dashboard/views/SettingsView').then((mod) => ({ default: mod.SettingsView })),
  {
    ssr: false,
  }
)

// 图表组件 (数据可视化,体积较大)
export const DynamicRechartsComponents = {
  LineChart: dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false }),
  BarChart: dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false }),
  PieChart: dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false }),
  AreaChart: dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false }),
  RadarChart: dynamic(() => import('recharts').then((mod) => mod.RadarChart), { ssr: false }),
}

// 数学公式渲染器 (KaTeX,按需加载)
export const DynamicFormulaRenderer = dynamic(
  () => import('@/components/ui/ZoomableFormula').then((mod) => ({ default: mod.ZoomableFormula })),
  {
    ssr: false,
  }
)

// 图片缩放组件
export const DynamicPinchZoomImage = dynamic(
  () => import('@/components/ui/PinchZoomImage').then((mod) => ({ default: mod.PinchZoomImage })),
  {
    ssr: false,
  }
)

/**
 * 使用示例:
 *
 * import { DynamicCommunityView } from '@/lib/dynamic-imports'
 *
 * export default function Page() {
 *   return <DynamicCommunityView />
 * }
 */
