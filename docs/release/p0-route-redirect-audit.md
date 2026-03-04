# P0 路由重定向审计（T-006）

> 目标：覆盖 `/admin/**`、`/dashboard/**`、`/login`、`/register` 的重定向行为审计与修复闭环。

| route | auth_state | expected | actual(before) | fix | actual(after) | evidence |
|---|---|---|---|---|---|---|
| `/admin` | 未登录 | `/login?redirectTo=/admin` |  |  |  |  |
| `/admin` | 已登录 | 管理员总览面板 |  |  |  |  |
| `/admin/*` | 未登录 | `/login?redirectTo=原路径` |  |  |  |  |
| `/admin/content/review` | 已登录（ADMIN） | 正常访问（不退化） |  |  |  |  |
| `/admin/feedback` | 已登录（ADMIN） | 正常访问（不退化） |  |  |  |  |
| `/admin/users` | 已登录（ADMIN） | 正常访问（不退化）且列表主区全宽渲染 | 右侧存在异常留白 | 修复容器全宽约束：`/admin/users/page.tsx` 与 `UserTable` 根节点补 `w-full` | 页面全宽展示，右侧留白消除 | main@5d2fb92 |
| `/admin/referrals` | 已登录（ADMIN/TEACHER） | 正常访问，且“用户管理”分组保持展开 | 页面可访问但缺统一侧边栏嵌套与分组状态不稳定 | 接入 `AdminClientWrapper` + sidebar 子菜单入口 + 分组展开规则收敛 | 页面与侧边栏行为一致 | main@924c0cf, main@5d2fb92 |
| `/admin/vouchers` | 已登录（ADMIN） | 正常访问，且“内容管理”分组覆盖该路由 | 页面未使用统一 admin 容器，缺侧边栏嵌套 | 接入 `AdminClientWrapper` 并扩展内容分组匹配到 `/admin/vouchers` | 页面与 admin 其他子页一致 | main@5d2fb92 |
| `/dashboard/*` | 未登录 | `/login?redirectTo=原路径` |  |  |  |  |
| `/dashboard/debug/ui-kit` | 任意登录态 | 调试页下线并返回 404 | 调试页可访问 | 路由文件改为显式 `notFound()` | 直接返回 404 | workspace change (2026-03-04) |
| `/dashboard/knowledge-graph` | 任意登录态 | 功能页下线并返回 404 | 功能页可访问 | 路由文件改为显式 `notFound()` | 直接返回 404 | workspace change (2026-03-04) |
| `/login` | 已登录 | 按 `redirectTo` 或默认 `/dashboard` |  |  |  |  |
| `/register` | 已登录 | 按 `redirectTo` 或默认 `/dashboard` |  |  |  |  |

## 备注
- `actual(before)`：修复前真实行为
- `fix`：修复动作（文件 + 改动摘要）
- `actual(after)`：修复后行为
- `evidence`：Playwright 截图/网络日志/关键请求记录
