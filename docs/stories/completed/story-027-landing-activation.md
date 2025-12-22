# Story-027: Landing Page Activation

**状态**: Completed ✅
**优先级**: P1
**前置任务**: Story-026

## 1. 目标
让首页 (Landing Page) 的所有交互元素（CTA 按钮、动态数据展示）真正生效，不再是静态展示。

## 2. 任务拆解
- [x] **Dynamic Stats**:
    - 替换 Hero Section 的 "Active Students" 数字，改为从数据库 `User` 表 count 获取（或缓存值）。
- [x] **CTA Routing**:
    - 检查所有 "Get Started", "Try Free" 按钮。
    - 未登录用户 -> `/register`。
    - 已登录用户 -> `/dashboard`。
- [x] **SEO Optimization**:
    - 为 Landing Page 添加动态 Metadata (Title, Description, OG Image)。
    - 生成 `sitemap.xml`。

## 3. 验收标准
- [x] 首页的统计数字反映真实（或种子）数据。
- [x] 点击任意 CTA 按钮，根据登录状态正确跳转。
- [x] 页面 Meta 标签正确。
