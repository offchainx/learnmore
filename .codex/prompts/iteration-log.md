- 2026-04-02: Close T-008 community workstream (T-008.7~T-008.10 final validation, real derived contributors/topics, attachment click-through to post detail, AI hint inline render, bookmark/share/comment/like persistence).
- 2026-04-01: Start T-024.A UI refactor (右侧弹出卡片 + 三段式：顶部状态栏/时间线/处理工作台；处理工作台含 Public Reply/Internal Note、NEXT STATUS 可变更、Templates；刷新与最新回显保持一致）。
- 2026-04-02: Fix community interactions cache invalidation (toggleLike now revalidates community feed/categories after like/unlike; comment/post side-effects keep feed freshness aligned with DB writes).
- 2026-04-02: Close T-005 Dashboard real-data workstream and extend handle identity system (dashboard real-data closeout, daily-task idempotency, lightweight practice timer, community handle mentions, reserved_handles, public /u/[handle], live handle availability checks, hydration mismatch fixes).
- 2026-04-03: Close T-009 admin home real-data cleanup (admin overview/workQueue/risks/audits real-data closeout, role matrix for ADMIN/TEACHER/PARENT/STUDENT, cache invalidation and audit trail cleanup, remove obsolete /admin/permissions path, ensure T-009.1~T-009.9 are收口完成).

| 2026-04-03 | T-010 用户管理域收口 | 推进 T-010.8~T-010.11 的假数据清理、权限交互收口与验证 | 完成用户管理域的静态回执/死链清理、权限交互真实化、权限覆写与到期回收验证 | 清理假数据组件、补充真实确认态和错误态、新增权限覆写单测 | Next.js 热更新曾短暂报旧模块引用，重启开发服务即可恢复 | 以后先查验缓存/热更新残留，再判断是否需要改代码 | 开始前先确认 T-011 反馈域边界与约束 |

## 约束
