# P0 路由重定向审计（T-006）

> 目标：覆盖 `/admin/**`、`/dashboard/**`、`/login`、`/register` 的重定向行为审计与修复闭环。

| route | auth_state | expected | actual(before) | fix | actual(after) | evidence |
|---|---|---|---|---|---|---|
| `/admin` | 未登录 | `/login?redirectTo=/admin` |  |  |  |  |
| `/admin` | 已登录 | 管理员总览面板 |  |  |  |  |
| `/admin/*` | 未登录 | `/login?redirectTo=原路径` |  |  |  |  |
| `/admin/content/review` | 已登录（ADMIN） | 正常访问（不退化） |  |  |  |  |
| `/admin/feedback` | 已登录（ADMIN） | 正常访问（不退化） |  |  |  |  |
| `/admin/users` | 已登录（ADMIN） | 正常访问（不退化） |  |  |  |  |
| `/dashboard/*` | 未登录 | `/login?redirectTo=原路径` |  |  |  |  |
| `/login` | 已登录 | 按 `redirectTo` 或默认 `/dashboard` |  |  |  |  |
| `/register` | 已登录 | 按 `redirectTo` 或默认 `/dashboard` |  |  |  |  |

## 备注
- `actual(before)`：修复前真实行为
- `fix`：修复动作（文件 + 改动摘要）
- `actual(after)`：修复后行为
- `evidence`：Playwright 截图/网络日志/关键请求记录
