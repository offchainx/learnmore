# Deprecated Components

此目录包含已废弃的组件文件，保留用于历史参考。

## Community 模块废弃文件

### CommunityView.OLD.tsx
- **废弃日期**: 2026-02-06
- **废弃原因**: 使用Mock数据和Gemini AI，已被正确的Server Actions版本替代
- **正确版本**: `src/components/dashboard/views/CommunityView.tsx`
- **差异**:
  - 旧版本使用硬编码的帖子数组和Gemini AI集成
  - 新版本使用Server Actions (`@/actions/community.ts`) 连接数据库
  - 新版本支持真实的帖子创建、点赞、评论功能
- **迁移完成**: ✅ 所有引用已更新到正确版本

---

⚠️ **警告**: 请勿使用此目录中的文件。它们仅用于历史参考。
