# Story-026: Email Service & Marketing Content

**状态**: In Review 🟠
**优先级**: P1
**前置任务**: Story-025

## 1. 目标
集成邮件服务（Resend 或 SendGrid），实现营销和通知功能。同时让 `/blog` 页面具备动态数据能力。

## 2. 任务拆解
- [x] **Email Infrastructure**:
    - 配置 Resend/SendGrid API Key。
    - 编写发送邮件的通用 Utility 函数。
- [x] **Newsletter**:
    - 在 `/blog` 和 Landing Page 底部实现 "Subscribe" 表单。
    - 创建 Server Action 将邮箱写入 `Subscriber` 表。
    - 发送 "Welcome" 确认邮件。
- [x] **Blog Engine**:
    - 创建 Server Action `getBlogPosts` (从 `BlogPost` 表读取)。
    - 更新 `/blog` 页面，替换 Mock 数据为数据库数据。
    - 实现 `/blog/[slug]` 动态路由详情页。

## 3. 验收标准
- [x] 在首页输入邮箱订阅，数据库 `Subscriber` 表新增记录。
- [x] 收到欢迎邮件。
- [x] `/blog` 页面显示数据库中的文章。