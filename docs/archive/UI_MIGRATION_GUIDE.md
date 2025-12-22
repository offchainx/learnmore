# UI迁移快速开始指南 (UI Migration Quick Start)

**目标**: 将Gemini AI Studio生成的页面迁移到Next.js主项目,实现UI定稿并部署预览

**预估时间**: 2-3天 (16-24小时)

---

## 📋 Phase 6 执行计划

### **Story-021**: UI组件迁移 (第1天: 6-8h)
### **Story-022**: Mock数据填充 (第1天: 4-6h)
### **Story-023**: 暗黑模式 (第2天: 3-4h)
### **Story-024**: Vercel部署 (第2天: 2-3h)
### **Story-025**: 反馈迭代 (第3天: 4-6h)

---

## 🚀 Story-021: UI组件迁移 (开始!)

### Step 1: 安装依赖

```bash
cd /Users/victorsim/Desktop/Projects/learn_more_v1.0

# 安装next-themes (主题切换)
pnpm add next-themes

# 安装Embla Carousel (轮播组件,可选)
pnpm add embla-carousel-react
```

### Step 2: 创建目录结构

```bash
# 创建营销页面路由组
mkdir -p src/app/\(marketing\)

# 创建仪表盘路由组
mkdir -p src/app/\(dashboard\)

# 创建营销组件目录
mkdir -p src/components/marketing

# 创建仪表盘组件目录
mkdir -p src/components/dashboard
mkdir -p src/components/dashboard/views

# 创建Mock数据目录
mkdir -p src/lib/mock
```

### Step 3: 迁移页面文件

#### 3.1 迁移Landing Page

**源文件**: `learnmore_aistudio/pages/LandingPage.tsx`
**目标**: `src/app/(marketing)/page.tsx`

**修改要点**:
```typescript
// src/app/(marketing)/page.tsx
'use client';  // ← 添加这行

import { useRouter } from 'next/navigation';  // ← 改用Next.js router
// 删除: import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const router = useRouter();  // ← 改用useRouter

  // 替换所有navigate()为router.push()
  // Before: navigate('/register')
  // After:  router.push('/register')

  return (
    // ... 保持原有JSX不变
  );
}
```

**完整操作**:
```bash
# 复制文件
cp learnmore_aistudio/pages/LandingPage.tsx src/app/\(marketing\)/page.tsx

# 手动修改(使用编辑器):
# 1. 添加 'use client' 在第一行
# 2. 替换 useNavigate → useRouter
# 3. 替换 navigate() → router.push()
```

#### 3.2 创建Marketing Layout

```bash
# 创建文件
touch src/app/\(marketing\)/layout.tsx
```

```typescript
// src/app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
```

#### 3.3 迁移Navbar组件

```bash
cp learnmore_aistudio/components/Navbar.tsx src/components/marketing/Navbar.tsx
```

**修改Navbar.tsx**:
```typescript
// src/components/marketing/Navbar.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';  // ← 添加Next.js Link

// 替换<Link>组件
// Before: <Link to="/dashboard">
// After:  <Link href="/dashboard">
```

然后更新Landing Page引用:
```typescript
// src/app/(marketing)/page.tsx
import { Navbar } from '@/components/marketing/Navbar';
```

#### 3.4 迁移Login/Register页面

```bash
# 创建auth路由组
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register

# 复制文件
cp learnmore_aistudio/pages/LoginPage.tsx src/app/\(auth\)/login/page.tsx
cp learnmore_aistudio/pages/RegisterPage.tsx src/app/\(auth\)/register/page.tsx
```

**修改两个文件**:
- 添加 `'use client'`
- 替换 `useNavigate` → `useRouter`
- 替换 `navigate()` → `router.push()`

#### 3.5 迁移Dashboard页面

```bash
# 复制Dashboard主文件
cp learnmore_aistudio/pages/Dashboard.tsx src/app/\(dashboard\)/page.tsx

# 复制Dashboard组件
cp learnmore_aistudio/components/dashboard/DashboardHome.tsx src/components/dashboard/
cp learnmore_aistudio/components/dashboard/CommunityView.tsx src/components/dashboard/
cp learnmore_aistudio/components/dashboard/Widgets.tsx src/components/dashboard/
cp learnmore_aistudio/components/dashboard/shared.tsx src/components/dashboard/

# 复制子视图
cp -r learnmore_aistudio/components/dashboard/views src/components/dashboard/
```

**修改Dashboard页面**:
```typescript
// src/app/(dashboard)/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { CommunityView } from '@/components/dashboard/CommunityView';
// ... 其他imports

export default function DashboardPage() {
  const router = useRouter();
  // ... 保持原有逻辑
}
```

### Step 4: 处理UI组件冲突

Gemini生成的Button/Card组件与Shadcn/ui有重复,选择保留Shadcn版本:

```bash
# 不要复制这些文件(使用Shadcn版本):
# - learnmore_aistudio/components/ui/Button.tsx
# - learnmore_aistudio/components/ui/Card.tsx
# - learnmore_aistudio/components/ui/Input.tsx
# - learnmore_aistudio/components/ui/Label.tsx
```

**修改所有组件中的import**:
```typescript
// Before (Gemini)
import { Button } from '../components/ui/Button';

// After (Shadcn)
import { Button } from '@/components/ui/button';
```

### Step 5: 测试编译

```bash
# 启动开发服务器
pnpm dev

# 访问页面测试
# http://localhost:3000           → Landing Page
# http://localhost:3000/login     → Login Page
# http://localhost:3000/register  → Register Page
# http://localhost:3000/dashboard → Dashboard Page
```

**常见错误修复**:

1. **错误**: `Module not found: Can't resolve 'react-router-dom'`
   ```bash
   # 说明没有替换完useNavigate
   # 全局搜索并替换所有 useNavigate → useRouter
   ```

2. **错误**: `'use client' directive must be at the top`
   ```typescript
   // 确保'use client'在文件第一行,注释前面
   'use client';

   import React from 'react';
   ```

3. **错误**: `Image with src "/..." is missing required "width" and "height"`
   ```typescript
   // 使用next/image替换<img>
   import Image from 'next/image';

   <Image
     src="/hero-bg.jpg"
     alt="Hero"
     width={1920}
     height={1080}
     priority
   />
   ```

---

## 🎨 Story-022: Mock数据填充

### Step 1: 创建Mock数据文件

```bash
touch src/lib/mock/index.ts
```

```typescript
// src/lib/mock/index.ts

// 用户Mock数据
export const mockUser = {
  id: 'mock-user-1',
  email: 'demo@learnmore.com',
  username: 'Alex Zhang',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',  // 使用DiceBear头像API
  grade: 8,
  level: 12,
  xp: 3850,
  streak: 12,
  coins: 520,
  role: 'STUDENT',
};

// 统计数据
export const mockStats = {
  studyTime: 127,        // 分钟
  questionsSolved: 245,
  accuracy: 87,          // 百分比
  mistakes: 32,
  percentileRank: 78,
  practiceAvg: 85,
  mockExamAvg: 82,
};

// 学科数据
export const mockSubjects = [
  {
    id: 'math',
    name: '数学',
    icon: 'Calculator',
    color: 'blue',
    progress: 68,
    lastLesson: '二次函数的图像',
    masteryLevel: 85,
    totalLessons: 120,
    completedLessons: 82,
  },
  {
    id: 'physics',
    name: '物理',
    icon: 'Atom',
    color: 'purple',
    progress: 55,
    lastLesson: '牛顿第一定律',
    masteryLevel: 72,
    totalLessons: 90,
    completedLessons: 50,
  },
  {
    id: 'chemistry',
    name: '化学',
    icon: 'FlaskConical',
    color: 'green',
    progress: 42,
    lastLesson: '元素周期表',
    masteryLevel: 68,
    totalLessons: 85,
    completedLessons: 36,
  },
  {
    id: 'english',
    name: '英语',
    icon: 'Languages',
    color: 'pink',
    progress: 78,
    lastLesson: '现在完成时',
    masteryLevel: 88,
    totalLessons: 100,
    completedLessons: 78,
  },
  {
    id: 'chinese',
    name: '语文',
    icon: 'ScrollText',
    color: 'red',
    progress: 65,
    lastLesson: '古诗词鉴赏',
    masteryLevel: 75,
    totalLessons: 110,
    completedLessons: 72,
  },
  {
    id: 'biology',
    name: '生物',
    icon: 'Dna',
    color: 'teal',
    progress: 50,
    lastLesson: '细胞结构',
    masteryLevel: 70,
    totalLessons: 75,
    completedLessons: 38,
  },
];

// 排行榜数据
export const mockLeaderboard = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  userId: `user-${String(i + 1).padStart(3, '0')}`,
  username: ['Zhang Wei', 'Li Hua', 'Wang Ming', 'Liu Yang', 'Chen Jie', 'Zhao Lei', 'Sun Qi', 'Zhou Xin', 'Wu Yue', 'Zheng Hao'][i],
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`,
  points: 9850 - (i * 500),
  level: 24 - i,
  badge: i < 3 ? ['gold', 'silver', 'bronze'][i] : null,
}));

// 社区帖子
export const mockPosts = [
  {
    id: 'post-1',
    authorName: 'Li Hua',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiHua',
    title: '二次函数压轴题求助',
    content: '这道题的第二问完全没思路,求大神指点!题目是:已知抛物线y=ax²+bx+c经过点A(1,0)和B(3,0),且顶点在直线y=2x-1上...',
    subject: '数学',
    tags: ['压轴题', '二次函数', '求助'],
    likeCount: 12,
    commentCount: 5,
    viewCount: 89,
    createdAt: '2小时前',
    isPinned: false,
  },
  {
    id: 'post-2',
    authorName: 'Zhang Wei',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei',
    title: '物理实验报告模板分享',
    content: '整理了一份完整的实验报告模板,包含实验目的、器材、步骤、数据记录和结论部分...',
    subject: '物理',
    tags: ['资源分享', '实验报告'],
    likeCount: 34,
    commentCount: 12,
    viewCount: 256,
    createdAt: '昨天 14:32',
    isPinned: true,
  },
  {
    id: 'post-3',
    authorName: 'Wang Ming',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangMing',
    title: '英语作文万能句型总结',
    content: '整理了考试常用的50个万能句型,包括开头、过渡、结尾等...',
    subject: '英语',
    tags: ['作文技巧', '备考资料'],
    likeCount: 56,
    commentCount: 18,
    viewCount: 412,
    createdAt: '3天前',
    isPinned: false,
  },
];

// 每日任务
export const mockDailyQuests = [
  {
    id: 'quest-1',
    title: '完成3道练习题',
    description: '在任意科目完成3道练习题',
    icon: 'PenTool',
    progress: 2,
    target: 3,
    reward: { xp: 50, coins: 10 },
    status: 'in_progress',
  },
  {
    id: 'quest-2',
    title: '观看1节视频课',
    description: '完整观看一节视频课程',
    icon: 'Video',
    progress: 0,
    target: 1,
    reward: { xp: 30, coins: 5 },
    status: 'pending',
  },
  {
    id: 'quest-3',
    title: '帮助1位同学解答',
    description: '在社区回答一个问题',
    icon: 'MessageCircle',
    progress: 1,
    target: 1,
    reward: { xp: 100, coins: 20 },
    status: 'completed',
  },
  {
    id: 'quest-4',
    title: '连续登录7天',
    description: '保持学习热情不断线',
    icon: 'Flame',
    progress: 5,
    target: 7,
    reward: { xp: 200, coins: 50, badge: '坚持之星' },
    status: 'in_progress',
  },
];

// 课程进度
export const mockCourseProgress = [
  {
    id: 'lesson-1',
    subjectId: 'physics',
    subjectName: '物理',
    title: '牛顿第一定律',
    chapterName: '力学基础',
    progress: 75,
    duration: 1200,  // 秒
    currentTime: 900,
    thumbnail: 'https://placehold.co/400x225/1e3a8a/white?text=Physics',
    difficulty: 'medium',
    completedAt: null,
  },
  {
    id: 'lesson-2',
    subjectId: 'math',
    subjectName: '数学',
    title: '二次函数的图像',
    chapterName: '函数',
    progress: 100,
    duration: 1500,
    currentTime: 1500,
    thumbnail: 'https://placehold.co/400x225/1e40af/white?text=Math',
    difficulty: 'hard',
    completedAt: '2024-12-10T10:30:00Z',
  },
  {
    id: 'lesson-3',
    subjectId: 'english',
    subjectName: '英语',
    title: '现在完成时态',
    chapterName: '语法',
    progress: 30,
    duration: 900,
    currentTime: 270,
    thumbnail: 'https://placehold.co/400x225/db2777/white?text=English',
    difficulty: 'easy',
    completedAt: null,
  },
];
```

### Step 2: 使用Mock数据

```typescript
// src/app/(dashboard)/page.tsx
import { mockUser, mockStats, mockSubjects, mockDailyQuests } from '@/lib/mock';

export default function DashboardPage() {
  return (
    <DashboardHome
      user={mockUser}
      stats={mockStats}
      subjects={mockSubjects}
      dailyQuests={mockDailyQuests}
    />
  );
}
```

### Step 3: 添加Placeholder图片

使用免费的Placeholder服务:
- **头像**: `https://api.dicebear.com/7.x/avataaars/svg?seed={name}`
- **通用图片**: `https://placehold.co/{width}x{height}/{bgColor}/{textColor}?text={text}`

---

## 🌓 Story-023: 暗黑模式

```bash
# 安装next-themes
pnpm add next-themes
```

**修改layout.tsx**:
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 🚀 Story-024: Vercel部署

```bash
# 1. 测试本地构建
pnpm build
pnpm start

# 2. 部署到Vercel
vercel

# 3. 查看预览链接
# https://your-project-name.vercel.app
```

---

## ✅ 验收Checklist

完成后验证以下项目:

### 页面可访问性
- [ ] Landing Page (`/`) 正常显示
- [ ] Login Page (`/login`) 正常显示
- [ ] Register Page (`/register`) 正常显示
- [ ] Dashboard Page (`/dashboard`) 正常显示

### 数据显示
- [ ] Dashboard显示Mock用户信息(头像/用户名/等级)
- [ ] 学科卡片显示6个科目
- [ ] 排行榜显示Top 10
- [ ] 社区显示3条帖子
- [ ] 每日任务显示4个任务

### 交互功能
- [ ] 导航栏路由跳转正常
- [ ] Dashboard侧边栏切换视图正常
- [ ] 主题切换按钮工作正常
- [ ] 响应式布局(手机/平板/桌面)正常

### 部署验证
- [ ] Vercel构建成功
- [ ] 预览链接可访问
- [ ] 所有静态资源加载正常

---

## 🐛 常见问题

### Q1: 图片加载失败
**A**: 使用Placeholder服务或添加`next.config.js`配置:
```javascript
module.exports = {
  images: {
    domains: ['api.dicebear.com', 'placehold.co'],
  },
};
```

### Q2: 暗黑模式闪烁
**A**: 确保`<html>`标签添加了`suppressHydrationWarning`

### Q3: 路由404
**A**: 检查文件夹名称是否使用了路由组语法`(marketing)`

---

**完成时间线**:
- ✅ Day 1: Story-021 + Story-022
- ✅ Day 2: Story-023 + Story-024
- ✅ Day 3: Story-025 (反馈迭代)

**预期产出**:
- Vercel预览链接(https://xxx.vercel.app)
- 完整的静态UI展示
- 为后续功能打通做好准备
