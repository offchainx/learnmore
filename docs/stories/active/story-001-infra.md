# Story-001-infra: Infrastructure Initialization

**Phase**: Phase 1: Foundation
**Goal**: 搭建坚实的 Next.js 开发环境,集成核心技术栈,确保"Hello World"跑通
**预估时间**: 1.5-2 Hours
**Story Points**: 2
**前置依赖**: 无 (项目起点)
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [ ] Next.js 14+ (App Router) 项目初始化成功
- [ ] Tailwind CSS + Shadcn/ui 配置完成,样式生效
- [ ] 目录结构按照 `tech_stack.md` 规范建立 (`src/actions`, `src/components` 等)
- [ ] 环境变量 (`.env`) 配置完成,包含 Supabase Keys
- [ ] ESLint / Prettier 规则配置完成,无红线报错
- [ ] Git 仓库初始化,提交第一次 Commit

---

## 2. Tech Plan (技术方案)

### 2.1 初始化命令

```bash
# 使用 pnpm 作为包管理器
pnpm create next-app@latest . --typescript --tailwind --eslint

# 交互选项:
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

### 2.2 依赖安装

```bash
# UI Components
npx shadcn-ui@latest init
# 选择 Default style, Zinc color

# 核心依赖
pnpm add @prisma/client @supabase/ssr @supabase/supabase-js zod zustand lucide-react
pnpm add -D prisma @types/node

# 开发工具
pnpm add -D prettier prettier-plugin-tailwindcss
```

### 2.3 目录重构

创建标准目录结构:

```
src/
├── app/
│   ├── (auth)/          # 认证路由组 (登录/注册)
│   ├── (dashboard)/     # 需鉴权路由组
│   ├── api/             # API Routes
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 首页
├── components/
│   ├── ui/              # Shadcn基础组件
│   └── business/        # 业务组件
├── lib/
│   ├── supabase.ts      # Supabase客户端单例
│   ├── prisma.ts        # Prisma客户端单例
│   └── utils.ts         # 工具函数
├── actions/             # Server Actions
├── types/               # TypeScript类型定义
└── styles/
    └── globals.css      # 全局样式
```

### 2.4 环境变量配置

创建 `.env.local`:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # 用于 Prisma Migrate

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 2.5 代码质量配置

创建 `.prettierrc.json`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

更新 `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## 3. Verification (测试验收)

### 功能性测试

- [ ] 运行 `pnpm dev`,应用在 `http://localhost:3000` 启动成功
- [ ] 访问首页,无控制台错误
- [ ] 页面显示 Shadcn 的 Button 组件,且样式正确 (Tailwind 生效)
- [ ] 控制台无 Hydration Error

### 代码质量测试

- [ ] 运行 `pnpm lint`,无 ESLint 错误
- [ ] 运行 `pnpm build`,构建成功
- [ ] Git 状态干净 (除 node_modules, .next, .env.local 外)

### 环境变量测试

- [ ] 创建测试文件验证 Supabase 连接:

```typescript
// src/lib/__tests__/supabase-connection.test.ts
import { createClient } from '@/lib/supabase'

async function testConnection() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  console.log('Supabase connected:', !error)
}
```

### 性能基线

- [ ] 首页 Lighthouse 分数 > 90 (Performance)
- [ ] 首页 First Contentful Paint < 1s

---

## 4. Deliverables (交付物)

- ✅ 干净的 Next.js 项目骨架
- ✅ 能够连接 Supabase 的工具函数
- ✅ Git Commit: `"chore: initialize project with Next.js and Supabase"`
- ✅ `.env.example` 文件 (不包含真实密钥)
- ✅ `README.md` 更新 (包含本地开发步骤)

---

## 5. Definition of Done (完成标准)

### 代码质量

- [ ] 通过 ESLint 检查 (0 errors, 0 warnings)
- [ ] Prettier 格式化完成 (运行 `pnpm format`)
- [ ] 无 TypeScript 类型错误 (`pnpm tsc --noEmit`)

### 文档完整性

- [ ] README.md 包含:
  - 项目介绍
  - 技术栈列表
  - 本地开发启动步骤
  - 环境变量说明
- [ ] `.env.example` 文件已创建并包含所有必需变量

### 部署就绪

- [ ] Git 仓库已初始化 (`.gitignore` 配置正确)
- [ ] 首次 Commit 已提交并 Push
- [ ] 可选: Vercel 项目已创建并关联 (为后续自动部署准备)

### 团队协作

- [ ] 在项目看板中标记此 Story 为"已完成"
- [ ] 通知团队成员: "开发环境已就绪,可以开始 Story-002"

---

## 6. Rollback Plan (回滚预案)

**触发条件**:

- 项目初始化失败,无法启动
- 依赖包版本冲突

**回滚步骤**:

1. 删除 `node_modules` 和 `pnpm-lock.yaml`
2. 重新运行 `pnpm install`
3. 如果仍失败,检查 Node.js 版本 (需要 >= 20.0.0)

**预防措施**:

- 使用固定版本号,避免 `^` 或 `~` 带来的不确定性
- 将 `pnpm-lock.yaml` 提交到 Git

---

## 7. Post-Completion Actions (完成后行动)

### 立即执行

- [ ] 将此文件从 `backlog/` 移至 `completed/`
- [ ] 更新 `README.md` 中的进度: "Phase 1: 1/5 completed"
- [ ] 在 Slack/微信群 通知: "✅ Story-001 完成,可以开始 002"

### 可选执行

- [ ] 截图首页,作为"Day 1"里程碑记录
- [ ] 记录 Supabase 项目配置 (方便未来多环境部署)

### 性能监控

- [ ] 记录初始构建时间 (Baseline): `pnpm build` 耗时
- [ ] 记录初始包大小: `.next/static/chunks` 大小

---

## 8. Notes & Learnings (开发过程中填写)

### 遇到的坑

_(开发时填写)_

- 示例: Shadcn init 时选择了错误的样式,需要重新运行

### 解决方案

_(开发时填写)_

- 示例: 删除 `components.json` 后重新运行 `shadcn-ui init`

### 可复用的代码片段

_(开发时填写)_

- 示例: Supabase 客户端单例模式的封装代码

### 时间记录

- **预估时间**: 1.5-2 hours
- **实际时间**: \_\_\_ hours
- **偏差分析**: \_\_\_

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-09
**状态**: In Progress 🟡
