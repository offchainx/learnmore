# 废弃文件说明

本目录包含在代码审计中发现的重复/未使用文件。

**废弃日期**: 2026-02-06
**审计文档**: `docs/FEATURE_AUDIT.md`

---

## 📂 目录结构

```
__deprecated__/
├── app-dashboard-duplicate/
│   └── DashboardClient.tsx.bak (282行) - 重复的 Dashboard 客户端组件
├── components-business-duplicate/
│   ├── DailyInspiration.tsx.bak - 与 Widgets.tsx 重复 (来自 business/)
│   ├── DailyInspiration-dashboard.tsx.bak - 与 Widgets.tsx 重复 (来自 dashboard/)
│   ├── CircularProgress-business.tsx.bak - 与 Widgets.tsx 重复 (来自 business/)
│   ├── CircularProgress-dashboard.tsx.bak - 与 Widgets.tsx 重复 (来自 dashboard/)
│   ├── SidebarItem-dashboard.tsx.bak - 与 Widgets.tsx 重复
│   ├── StrengthBar-dashboard.tsx.bak - 与 Widgets.tsx 重复
│   ├── SubjectCard.tsx.bak - 与 Widgets.tsx 重复 (来自 business/)
│   ├── SubjectCard-dashboard.tsx.bak - 与 Widgets.tsx 重复 (来自 dashboard/)
│   └── DashboardCharts.tsx.bak - 未被任何页面引用
└── components/business/settings/
    ├── BadgeGrid.tsx - Settings模块未使用的徽章展示组件
    └── ai-config-form.tsx - Settings模块未使用的AI配置表单
```

---

## 🔴 废弃原因

### 1. app-dashboard-duplicate/DashboardClient.tsx.bak

**问题**: 重复开发

**详情**:
- 项目中存在两个 DashboardClient:
  - ✅ `components/dashboard/DashboardClient.tsx` (108行) - 实际使用
  - ❌ `app/(dashboard)/dashboard/DashboardClient.tsx` (282行) - 从未被使用

**原因**:
- `app/(dashboard)/dashboard/page.tsx` Line 1 导入的是:
  ```typescript
  import { DashboardClient } from '@/components/dashboard/DashboardClient';
  ```
- 这个文件从未被引用过

**影响**: 占用空间 (282行)，造成维护混淆

---

### 2. components-business-duplicate/DailyInspiration.tsx.bak

**问题**: 功能重复

**详情**:
- Dashboard 使用的是 `components/dashboard/Widgets.tsx` 中的 DailyInspiration
- `components/business/DailyInspiration.tsx` 只被废弃的 DashboardClient.tsx.bak 引用

**原因**: 重复实现相同功能

**影响**: 代码重复，维护成本增加

---

### 3. components-business-duplicate/SubjectCard.tsx.bak

**问题**: 未被使用

**详情**:
- Dashboard 主页 (DashboardHome.tsx) 不包含学科卡片功能
- 只被废弃的 DashboardClient.tsx.bak 引用

**原因**: Dashboard UI 设计中无此功能

**影响**: 审计时造成混淆

---

### 4. components-business-duplicate/DashboardCharts.tsx.bak

**问题**: 未被引用

**详情**:
- DashboardHome.tsx 不使用此组件
- 只被废弃的 DashboardClient.tsx.bak 引用

**原因**: 统计图表功能未实现或已移除

**影响**: 冗余代码

---

### 5. components/business/settings/BadgeGrid.tsx

**问题**: 未被引用

**详情**:
- Settings模块的徽章展示组件
- 无任何文件引用此组件
- SettingsView.tsx 中没有使用徽章展示功能

**原因**: Settings UI 设计中无此功能

**影响**: 代码冗余

**审计日期**: 2026-02-06 (Settings模块审计)

---

### 6. components/business/settings/ai-config-form.tsx

**问题**: 未被引用

**详情**:
- Settings模块的AI配置表单组件
- 无任何文件引用此组件
- SettingsView.tsx 中已内联实现AI配置功能

**原因**: Settings已将AI配置逻辑整合到主视图中

**影响**: 代码重复

**审计日期**: 2026-02-06 (Settings模块审计)

---

## ⚠️ 删除建议

**等待期**: 保留 1 个月 (至 2026-03-06)

**条件**:
- ✅ 所有功能正常运行
- ✅ 无其他分支引用这些文件
- ✅ 团队成员确认无需恢复

**删除方法**:
```bash
rm -rf src/__deprecated__
```

---

## 🔍 审计追踪

**审计人员**: Claude Code AI
**审计方法**: 5层架构范式审计
**发现记录**: `docs/FEATURE_AUDIT.md` - Dashboard 功能审计部分

**相关修改**:
- ✅ 移除 AppSidebar 中的 "Mistake Book" 和 "UI Kit Debug" 菜单项
- ✅ 更新 FEATURE_AUDIT.md 纠正 Dashboard 组件路径
- ✅ 移动重复/废弃文件到 `__deprecated__/`
