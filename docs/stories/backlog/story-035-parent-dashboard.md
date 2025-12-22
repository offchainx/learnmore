# Story-035: Parent Dashboard

**状态**: Backlog ⚪
**优先级**: P3
**前置任务**: Story-025

## 1. 目标
为家长提供一个“只读视图”，查看孩子的学习进度。

## 2. 任务拆解
- [ ] **Parent Link**:
    - 实现“邀请码”生成与绑定逻辑（将 Parent User 关联到 Student User）。
- [ ] **Read-Only View**:
    - 简单的 Dashboard，显示孩子的：学习时长、最近完成课程、错题数量。
- [ ] **Weekly Report**:
    - (可选) 手动触发发送周报邮件给家长。

## 3. 验收标准
- [ ] 家长账号登录后，能看到关联孩子的核心数据。
- [ ] 家长账号无权修改孩子的学习进度。
