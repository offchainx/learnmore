- 2026-04-02: Close T-008 community workstream (T-008.7~T-008.10 final validation, real derived contributors/topics, attachment click-through to post detail, AI hint inline render, bookmark/share/comment/like persistence).
- 2026-04-01: Start T-024.A UI refactor (右侧弹出卡片 + 三段式：顶部状态栏/时间线/处理工作台；处理工作台含 Public Reply/Internal Note、NEXT STATUS 可变更、Templates；刷新与最新回显保持一致）。
- 2026-04-02: Fix community interactions cache invalidation (toggleLike now revalidates community feed/categories after like/unlike; comment/post side-effects keep feed freshness aligned with DB writes).
- 2026-04-02: Close T-005 Dashboard real-data workstream and extend handle identity system (dashboard real-data closeout, daily-task idempotency, lightweight practice timer, community handle mentions, reserved_handles, public /u/[handle], live handle availability checks, hydration mismatch fixes).
- 2026-04-03: Close T-009 admin home real-data cleanup (admin overview/workQueue/risks/audits real-data closeout, role matrix for ADMIN/TEACHER/PARENT/STUDENT, cache invalidation and audit trail cleanup, remove obsolete /admin/permissions path, ensure T-009.1~T-009.9 are收口完成).

| 2026-04-03 | T-010 用户管理域收口 | 推进 T-010.8~T-010.11 的假数据清理、权限交互收口与验证 | 完成用户管理域的静态回执/死链清理、权限交互真实化、权限覆写与到期回收验证 | 清理假数据组件、补充真实确认态和错误态、新增权限覆写单测 | Next.js 热更新曾短暂报旧模块引用，重启开发服务即可恢复 | 以后先查验缓存/热更新残留，再判断是否需要改代码 | 开始前先确认 T-011 反馈域边界与约束 |

| 2026-04-03 | T-012 referral telemetry closeout | 实现 referral 增长归因与 telemetry 留存，补分享落地页和支付透传，并切换 Prisma 到 directUrl | 已完成 T-012.4 收口：新增 referral_attribution_events 归因表、COPY/CLICK/BIND/CHECKOUT/SETTLE/REWARD_GRANT 写点、/r/[code] 分享落地页、SettingsView 与 Pricing 透传，Prisma 直连 directUrl 可用并已验证 | schema, billing referral, checkout, stripe webhook, pricing page, settings view, referral route, tasks.md | Prisma db push 在 pooler 连接下卡住，改用 directUrl 和原生 SQL 完成同步 | 归因链路从 copy/click 到 bind/checkout/settle/reward_grant 已闭环 | 继续推进 T-012.5 读取链路对齐 |

| 2026-04-03 | pricing build fix | 修复 /pricing 在 Vercel 预渲染阶段 useSearchParams() 缺少 Suspense boundary 的构建错误 | 已将 /pricing 拆分为服务端壳子 + 客户端组件，使用 Suspense 包裹 useSearchParams()，并修复内容审核测试的可选字段类型问题，pnpm build 已通过 | src/app/(marketing)/pricing/page.tsx, src/app/(marketing)/pricing/PricingPageClient.tsx, src/actions/content-pipeline/__tests__/review-closeout.test.ts | Next.js 预渲染 /pricing 时 useSearchParams() 触发 CSR bailout | pricing 页面现在可在 Vercel 生产构建中稳定 prerender | 继续推进 T-012.5 之前的内容由用户确认后再开始 |

| 2026-04-03 | dashboard Prisma pool timeout fix | 将 /dashboard 首屏的 Prisma 并发查询串行化，移除 Promise.all 和重复 count，降低单连接池环境下的超时风险 | 已修复 /dashboard 的 P2024 connection pool timeout，pnpm -s tsc --noEmit 与 pnpm run build 通过 | src/actions/dashboard.ts, src/app/(dashboard)/dashboard/page.tsx | 首屏多条 Prisma 查询并发执行，在 connection_limit=1 的环境下容易耗尽连接池 | 后续优先保持单连接兼容，再考虑局部缓存/批处理优化 | 修复后继续观察 Vercel runtime logs |

## 约束
