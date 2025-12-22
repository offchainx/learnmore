# Story-025: Auth Integration & Settings Page

**状态**: Completed ✅
**优先级**: P0
**前置任务**: Story-024

## 1. 目标
打通用户的注册、登录流程，实现真实的用户身份会话。同时完成 `/settings` 页面的功能开发，让用户可以管理个人资料和 AI 偏好。

## 2. 任务拆解
- [x] **Server Actions (Auth)**:
    - 实现 `register` action (写入 `User` 和 `UserSettings` 表)。
    - 实现 `login` action (验证 Supabase Auth 或密码)。
    - 实现 `logout` action。
    - 添加 Auth Middleware 保护 `/dashboard` 路由。
- [x] **Settings Page Logic**:
    - 在 `/settings` 页面读取当前用户的 `UserSettings`。
    - 实现 "Update Profile" (修改名字、Bio) 的 Server Action。
    - 实现 "AI Config" (修改性格、难度) 的 Server Action。
    - 实现 "Preferences" (语言、通知) 的保存。
- [x] **Context Hook**: 确保 `useApp` 的 `lang` 状态与数据库同步 (Login 后自动切换到用户设置的语言)。

## 3. 验收标准
- [x] 能够通过 `/register` 创建新账号,并自动跳转 Dashboard。
- [x] 能够通过 `/login` 登录。
- [x] 在 `/settings` 修改 AI 性格后,刷新页面配置依然保留。
- [x] 退出登录后被重定向回首页。
