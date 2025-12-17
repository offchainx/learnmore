# Story-023: 暗黑模式与主题切换

**状态**: Backlog ⚪
**优先级**: P1 (High)
**预计工时**: 3-4小时
**前置依赖**: Story-021
**阻塞Story**: Story-024

---

## 1. 目标 (Objectives)

- [ ] 集成next-themes库
- [ ] 创建主题切换按钮组件
- [ ] 配置Tailwind暗黑模式
- [ ] 确保所有页面支持暗黑模式

---

## 2. 技术方案 (Tech Plan)

### Step 1: 安装next-themes

```bash
pnpm add next-themes
```

### Step 2: 配置ThemeProvider

```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 3: 创建主题切换组件

```typescript
// src/components/ui/theme-toggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### Step 4: 配置Tailwind暗黑模式

```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  // ...
};
```

---

## 3. 验收标准 (Verification)

- [ ] 点击主题切换按钮可以切换亮/暗模式
- [ ] 刷新页面后主题设置保持
- [ ] 所有页面在暗黑模式下可读性良好

---

## 4. 交付物 (Deliverables)

- `src/components/ui/theme-toggle.tsx` - 主题切换组件
- 更新后的 `src/app/layout.tsx`
- 更新后的 `tailwind.config.ts`

---

## 5. Definition of Done

- [x] 所有Objectives已完成
- [x] 所有Verification测试通过
- [x] 质量检查通过
- [x] 代码已commit
- [x] 文档已更新

---

**创建时间**: 2025-12-13
