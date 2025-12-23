'use client'

import { PinchZoomImage } from '@/components/ui/PinchZoomImage'
import { ZoomableFormula } from '@/components/ui/ZoomableFormula'
import Image from 'next/image'

export default function ZoomDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">捏合缩放功能演示</h1>

      {/* 图片缩放示例 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. 图片缩放</h2>
        <p className="text-muted-foreground">
          双指捏合缩放 (1x~4x) · 双击切换缩放 · 拖拽平移
        </p>
        <div className="max-w-2xl mx-auto">
          <PinchZoomImage showControls={true}>
            <Image
              src="/placeholder.svg"
              alt="示例图片"
              width={800}
              height={600}
              className="rounded-lg"
            />
          </PinchZoomImage>
        </div>
      </section>

      {/* 数学公式缩放示例 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. 数学公式缩放</h2>
        <p className="text-muted-foreground">
          支持 LaTeX 渲染 + 捏合缩放
        </p>

        {/* 示例 1: 二次方程 */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">示例 1: 二次方程求根公式</h3>
          <ZoomableFormula
            latex="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
            displayMode={true}
          />
        </div>

        {/* 示例 2: 积分 */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">示例 2: 定积分</h3>
          <ZoomableFormula
            latex="\int_{a}^{b} f(x) \, dx = F(b) - F(a)"
            displayMode={true}
          />
        </div>

        {/* 示例 3: 矩阵 */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">示例 3: 矩阵</h3>
          <ZoomableFormula
            latex="\begin{bmatrix} a & b \\ c & d \end{bmatrix}"
            displayMode={true}
          />
        </div>

        {/* 示例 4: 求和 */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">示例 4: 求和公式</h3>
          <ZoomableFormula
            latex="\sum_{i=1}^{n} i = \frac{n(n+1)}{2}"
            displayMode={true}
          />
        </div>
      </section>

      {/* 使用说明 */}
      <section className="space-y-4 p-6 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold">使用说明</h2>
        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
          <li>移动端: 双指捏合缩放,拖拽平移,双击切换缩放</li>
          <li>桌面端: 鼠标滚轮缩放,拖拽平移,双击切换缩放</li>
          <li>缩放范围: 1x (原始大小) ~ 4x (最大放大)</li>
          <li>右上角按钮: 放大 (+) · 缩小 (-) · 重置 (↻)</li>
        </ul>
      </section>
    </div>
  )
}
