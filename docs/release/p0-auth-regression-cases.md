# P0 Auth 会话回归用例（AC-01 / AC-04 / AC-05）

## 用例映射
| case_id | 对应 AC | 对应任务 |
|---|---|---|
| 1-5 | AC-01 | T-005 / T-008 / T-009 |
| 6-8 | AC-04 | T-006 |
| 9-10 | AC-05 | T-007 |
| 11-13 | AC-04（回归） | T-006 / T-008 |
| 14-16 | AC-04（权限） | T-006 |

## AC-01 用例

### 用例 1：受保护路由回跳（redirectTo）
- Given：未登录用户直接访问 `/dashboard/practice`
- When：被重定向到 `/login?redirectTo=/dashboard/practice` 后登录成功
- Then：登录后应回到 `/dashboard/practice`，不是固定跳到 `/dashboard`

### 用例 2：登录成功后访问受保护路由
- Given：未登录用户
- When：登录成功并访问 `/dashboard`
- Then：正常进入 dashboard，不跳回 login

### 用例 3：显式登出
- Given：已登录用户
- When：点击退出
- Then：跳转 `/`，再次访问 `/dashboard` 会重定向 `/login`

### 用例 4：会话超时
- Given：已登录用户
- When：超过会话有效期后访问受保护页
- Then：重定向登录，并提示会话失效

### 用例 5：多标签页场景
- Given：同账号两个标签页
- When：标签页 A 登出后，标签页 B 发起请求
- Then：标签页 B 下次请求被重定向到登录

## AC-04 用例

### 用例 6：`/admin` 未登录保护与回跳
- Given：未登录用户访问 `/admin`
- When：进入登录页并完成登录
- Then：登录后回到 `/admin`，且保留原始 `redirectTo`

### 用例 7：`/admin` 登录后直达总览面板
- Given：已登录且具备权限的管理员用户
- When：访问 `/admin`
- Then：进入管理员总览面板，不重定向到 `/admin/content/review`

### 用例 8：已登录用户访问 `/login` 或 `/register`
- Given：已登录用户
- When：访问 `/login` 或 `/register`
- Then：按 `redirectTo` 或默认 `/dashboard` 跳转

## AC-05 用例

### 用例 9：空闲态异常请求观测（1-3 分钟）
- Given：用户未点击任何前端按钮，页面保持空闲
- When：观测浏览器 Network 与服务端日志
- Then：`POST /admin/feedback` 非预期周期请求应消除

### 用例 10：`/api/auth/impersonate/status` 轮询频率校验
- Given：页面空闲状态
- When：观测 `GET /api/auth/impersonate/status` 请求频率
- Then：频率符合设计，且不存在多余触发源

## AC-04 回归保护用例（关键路由不退化）

### 用例 11：`/admin/content/review` 不退化
- Given：已登录管理员
- When：访问 `/admin/content/review`
- Then：页面可正常访问，行为与修复前一致

### 用例 12：`/admin/feedback` 不退化
- Given：已登录管理员
- When：访问 `/admin/feedback`
- Then：页面可正常访问，且无非预期空闲态周期 POST

### 用例 13：`/admin/users` 不退化
- Given：已登录管理员
- When：访问 `/admin/users`
- Then：页面可正常访问，列表与操作入口不退化

## AC-04 权限矩阵用例

### 用例 14：ADMIN 访问 `/admin`
- Given：ADMIN 角色账号
- When：访问 `/admin`
- Then：进入管理员总览面板并可见全量模块

### 用例 15：TEACHER 访问 `/admin`
- Given：TEACHER 角色账号
- When：访问 `/admin`
- Then：进入管理员总览面板，但安全/伪装敏感区块隐藏

### 用例 16：其他角色访问 `/admin`
- Given：非 ADMIN/TEACHER 角色账号
- When：访问 `/admin`
- Then：重定向到 `/dashboard`
