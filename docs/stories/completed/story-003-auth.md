# Story-003-auth: Authentication System

**Phase**: Phase 1: Foundation
**Goal**: 实现完整的用户注册、登录、注销流程,并实现路由保护机制
**预估时间**: 6-8 Hours
**Story Points**: 8
**前置依赖**: Story-002 (数据库Schema已建立, Auth Trigger已配置)
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [ ] 创建登录页面 `/login` (Shadcn Form + Zod 验证)
- [ ] 创建注册页面 `/register`
- [ ] 实现后端 Server Actions: `loginAction()`, `signupAction()`, `logoutAction()`
- [ ] 实现路由保护 Middleware: 未登录用户访问 `/dashboard` 自动跳转登录页
- [ ] 顶部导航栏显示当前用户信息 (Avatar + Username + Logout Button)
- [ ] 验证 Auth Trigger 正常工作 (注册后 `public.users` 表自动同步)

---

## 2. Tech Plan (技术方案)

### 2.1 Supabase Auth 集成

创建 `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}
```

创建 `src/lib/supabase/client.ts` (客户端):

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2.2 Server Actions

创建 `src/actions/auth.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  username: z.string().min(2, '用户名至少2位').optional(),
})

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export async function signupAction(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string | undefined,
  }

  // Zod 验证
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = createClient()

  // 注册用户 (会自动触发 Auth Trigger 同步到 public.users)
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: '邮箱或密码错误' }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// 获取当前用户
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 从 public.users 获取完整用户信息
  const prisma = await import('@/lib/prisma').then((m) => m.default)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return dbUser
}
```

### 2.3 登录页面

创建 `src/app/(auth)/login/page.tsx`:

```typescript
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>输入您的账号信息</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              登录
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              还没有账号?{' '}
              <Link href="/register" className="underline">
                立即注册
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2.4 注册页面

创建 `src/app/(auth)/register/page.tsx`:

```typescript
import { signupAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建您的学习账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signupAction} className="space-y-4">
            <div>
              <Label htmlFor="username">用户名 (可选)</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="张三"
              />
            </div>
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少6位"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              注册
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号?{' '}
              <Link href="/login" className="underline">
                立即登录
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2.5 路由保护 Middleware

创建 `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 保护需要登录的路由
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 如果已登录,访问登录页则跳转到 dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2.6 用户导航组件

创建 `src/components/business/UserNav.tsx`:

```typescript
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/actions/auth'
import { User } from '@prisma/client'

interface UserNavProps {
  user: Pick<User, 'username' | 'email' | 'avatar'>
}

export function UserNav({ user }: UserNavProps) {
  const displayName = user.username || user.email.split('@')[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user.avatar || undefined} alt={displayName} />
            <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings">个人设置</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard">学习中心</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutAction()}
          className="text-red-600"
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 3. Verification (测试验收)

### 功能性测试

- [ ] 访问 `/register`,页面正常渲染
- [ ] 注册新用户 (邮箱: test@example.com, 密码: test123),提交成功
- [ ] 自动跳转到 `/dashboard`
- [ ] 检查 Supabase Auth Dashboard,用户已创建
- [ ] 检查 `public.users` 表,用户记录已同步 (验证 Trigger)

### Auth Trigger 验证 (关键!)

```sql
-- 在 Supabase SQL Editor 中执行
SELECT
  a.id,
  a.email,
  a.created_at as auth_created_at,
  u.id as user_id,
  u.email as user_email,
  u.created_at as user_created_at
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
ORDER BY a.created_at DESC
LIMIT 5;

-- 验证点: auth.users 和 public.users 的记录应该一一对应
```

### 登录测试

- [ ] 点击"退出登录"
- [ ] 访问 `/login`
- [ ] 输入错误密码,显示错误提示
- [ ] 输入正确密码,登录成功并跳转到 `/dashboard`

### 路由保护测试

- [ ] 退出登录状态下,直接访问 `/dashboard`,应重定向到 `/login`
- [ ] 登录状态下,访问 `/login`,应重定向到 `/dashboard`
- [ ] 登录状态下,访问 `/dashboard`,正常显示页面

### 用户导航测试

- [ ] 顶部右上角显示用户头像
- [ ] 点击头像,下拉菜单显示用户名和邮箱
- [ ] 点击"退出登录",成功退出并跳转到登录页

### 表单验证测试

- [ ] 注册时邮箱格式错误,显示错误提示
- [ ] 注册时密码少于6位,显示错误提示
- [ ] 注册时邮箱已存在,显示"用户已存在"错误

### 性能测试

- [ ] 登录请求响应时间 < 500ms (P95)
- [ ] Middleware 认证检查时间 < 100ms
- [ ] 首次加载登录页 FCP < 1s

---

## 4. Deliverables (交付物)

- ✅ 完整的认证系统 (注册/登录/登出)
- ✅ 路由保护 Middleware
- ✅ 用户导航组件
- ✅ Supabase Auth 工具函数封装
- ✅ Git Commit: `"feat: implement authentication system with Supabase"`

---

## 5. Definition of Done (完成标准)

### 代码质量

- [ ] 所有 Server Actions 都有 Zod 验证
- [ ] 密码在传输和存储中都加密 (Supabase 自动处理)
- [ ] 没有硬编码的敏感信息 (密钥都在环境变量中)
- [ ] 通过 ESLint 和 TypeScript 检查

### 安全性

- [ ] 登录失败不暴露用户是否存在 (统一返回"邮箱或密码错误")
- [ ] 使用 HttpOnly Cookies 存储 Session (Supabase 自动处理)
- [ ] Middleware 正确处理所有认证场景
- [ ] 没有 CSRF 漏洞 (Next.js Server Actions 自动防护)

### 用户体验

- [ ] 表单验证错误提示清晰
- [ ] 登录/注册有 Loading 状态 (可选)
- [ ] 密码输入框支持显示/隐藏切换 (可选)
- [ ] 移动端表单布局正常

### 文档完整性

- [ ] README 更新: 增加"用户认证"章节
- [ ] 环境变量文档更新 (`.env.example`)
- [ ] 团队成员知道如何创建测试用户

---

## 6. Rollback Plan (回滚预案)

**触发条件**:

- Auth Trigger 失败,用户注册后无法同步到 `public.users`
- Middleware 导致所有用户无法访问应用
- Session 管理出现问题,用户频繁掉线

**回滚步骤**:

### 场景A: Auth Trigger 失败

```bash
# 1. 检查 Trigger 状态
SELECT tgname, tgenabled FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

# 2. 如果 Trigger 未启用,重新创建
# (执行 Story-002 中的 Trigger SQL)

# 3. 手动同步已有用户
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT id, email, created_at, updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

### 场景B: Middleware 导致应用无法访问

```bash
# 临时禁用 Middleware
# 1. 重命名文件
mv src/middleware.ts src/middleware.ts.bak

# 2. 重新部署
vercel --prod

# 3. 修复 Middleware 后恢复
mv src/middleware.ts.bak src/middleware.ts
```

### 场景C: Session 问题

```typescript
// 在 Supabase Dashboard 中重置所有 Session
// Settings → Auth → Sessions → Revoke all sessions
```

**预防措施**:

- 在 Staging 环境充分测试认证流程
- 监控 Auth Trigger 的执行日志
- 设置告警: 如果 `auth.users` 和 `public.users` 数量差异 > 5,发送通知

---

## 7. Post-Completion Actions (完成后行动)

### 立即执行

- [ ] 将此文件从 `backlog/` 移至 `completed/`
- [ ] 更新 `README.md` 进度: "Phase 1: 3/5 completed"
- [ ] 通知团队: "✅ 认证系统就绪,可以开始需要登录的功能开发"
- [ ] 在 Slack/群聊 分享测试账号: test@example.com / test123

### 数据准备

- [ ] 创建3-5个测试用户 (学生角色)
- [ ] 创建1个管理员账号 (手动在数据库中设置 role=ADMIN)

### 监控配置

- [ ] 在 Sentry 中设置认证错误追踪
- [ ] 在 Supabase Dashboard 中启用 Auth 日志
- [ ] 记录基线指标:
  - 登录成功率: \_\_\_
  - 平均登录时间: \_\_\_

### 文档补充

- [ ] 创建 `docs/auth/README.md`:
  - 认证流程图
  - 常见问题 FAQ
  - 调试 Auth Trigger 的步骤

---

## 8. Notes & Learnings (开发过程中填写)

### 遇到的坑

_(开发时填写)_

- 示例: Middleware 中的 `createServerClient` cookie 配置容易出错
- 示例: Auth Trigger 权限不足导致同步失败

### 解决方案

_(开发时填写)_

- 示例: Middleware 必须使用 `NextResponse` 的 cookies API
- 示例: Trigger 函数需要 `SECURITY DEFINER` 和 `SET search_path`

### 可复用的代码片段

_(开发时填写)_

```typescript
// 在 Server Component 中获取当前用户
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <div>Welcome {user.username}</div>
}
```

### 时间记录

- **预估时间**: 6-8 hours
- **实际时间**: \_\_\_ hours
- **偏差分析**: \_\_\_

### 安全检查清单

- [ ] 密码不在客户端明文传输 ✅ (HTTPS)
- [ ] Session Token 存储在 HttpOnly Cookie ✅
- [ ] 没有 SQL 注入风险 ✅ (Prisma + Supabase)
- [ ] 没有 XSS 风险 ✅ (React 自动转义)
- [ ] 路由保护覆盖所有需要认证的页面 ✅

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-09
**状态**: Backlog ⚪
**风险等级**: 🔴 高 (认证是安全基础,必须严格测试)
