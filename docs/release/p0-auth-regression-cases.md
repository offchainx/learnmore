# P0 Auth 会话回归用例

## 用例 1：受保护路由回跳（redirectTo）
- Given: 未登录用户直接访问 `/dashboard/practice`
- When: 被重定向到 `/login?redirectTo=/dashboard/practice` 后登录成功
- Then: 登录后应回到 `/dashboard/practice`，不是固定跳到 `/dashboard`

## 用例 2：登录成功后访问受保护路由
- Given: 未登录用户
- When: 登录成功并访问 `/dashboard`
- Then: 正常进入 dashboard，不跳回 login

## 用例 3：显式登出
- Given: 已登录用户
- When: 点击退出
- Then: 跳转 `/`，再次访问 `/dashboard` 会重定向 `/login`

## 用例 4：会话超时
- Given: 已登录用户
- When: 超过会话有效期后访问受保护页
- Then: 重定向登录，并提示会话失效

## 用例 5：多标签页场景
- Given: 同账号两个标签页
- When: 标签页 A 登出后，标签页 B 发起请求
- Then: 标签页 B 下次请求被重定向到登录

## 用例 6：Landing 与 Dashboard 按钮状态
- Given: 已登录用户访问 `/`
- When: 页面渲染导航栏
- Then: 显示 Dashboard 入口而非 Login
