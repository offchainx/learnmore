# Component Audit

> 用于记录共享组件和页面壳层的现状、问题和迁移归属。

| component | path | current issues | owner spec | migration action | status |
|---|---|---|---|---|---|
| `Button` | `src/components/ui/button.tsx` | 仍保留 `glow` 等强视觉变体 | `specs/ws-04-tokenization-and-shared-ui-foundation/` | 收敛为语义化 variant | todo |
| `globals.css` | `src/app/globals.css` | token 与旧式 AI 视觉工具类并存 | `specs/ws-04-tokenization-and-shared-ui-foundation/` | 重整 token 与禁用项 | todo |
| `dashboard-layout` | `src/components/layout/dashboard-layout.tsx` | 壳层表达与部分旧装饰并存 | `specs/d-02-dashboard-shell/` | 跟随新 shell 方向收敛 | todo |
| marketing nav | `src/components/layout/LandingPageNavbar.tsx` | 渐变、glow、Sparkles 明显 | `specs/d-01-marketing/` | 重做为编辑感 + 温暖教育导航 | todo |

## 使用规则
- 只记录“需要迁移或重构”的共享层对象
- 页面内一次性小组件不在这里记录，放到对应页面域 `tasks.md`
