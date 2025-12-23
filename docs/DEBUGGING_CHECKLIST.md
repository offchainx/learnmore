# 🔍 系统化调试检查清单

## 目的
防止浪费时间和 AI Token,快速定位问题根源。

---

## 📋 调试流程 (必须按顺序执行)

### 第 0 步: 复现问题 (5 分钟)
- [ ] 清除浏览器所有 cookies 和缓存
- [ ] 重启开发服务器 (`pnpm dev`)
- [ ] 尝试复现问题 2-3 次,确认稳定复现
- [ ] 记录复现步骤

### 第 1 步: 检查服务器日志 (优先级最高!) ⭐
**为什么优先**: 80% 的 Next.js 问题会在服务器端显现

- [ ] 查看终端输出,寻找:
  - ❌ 错误堆栈 (红色文本)
  - ⚠️ 警告信息 (黄色文本)
  - 🔍 **缺失的预期日志** (最容易忽略!)

**关键检查**:
```bash
# 如果调用了 Server Action,应该看到日志
# 如果没有看到 → 说明 Server Action 根本没执行!
```

### 第 2 步: 检查浏览器 Console (5 分钟)
- [ ] 打开 DevTools (F12) → Console 标签
- [ ] 查找红色错误信息
- [ ] 查找黄色警告信息
- [ ] 检查 Network 标签:
  - 失败的请求 (红色)
  - 404 错误
  - 慢请求 (>1s)

### 第 3 步: 添加调试日志 (10 分钟)
**只在前两步无法定位时使用**

```typescript
// Server Component / Server Action
console.log('[ComponentName] 关键变量:', { var1, var2 })

// Client Component
console.log('[ClientComponent] 状态:', { state1, state2 })
```

**调试日志位置**:
- Server Actions: 函数开头和结尾
- 条件分支: 每个 if/else 分支
- 异步操作: await 前后

### 第 4 步: 检查常见陷阱 (Next.js 特有)

#### ⚠️ Server Action 陷阱
- [ ] **在 Client Component 中调用 Server Action?**
  - ❌ `onClick={() => serverAction()}`
  - ✅ `onClick={handleAction}` + `useTransition`
  - ✅ `<form action={serverAction}>`

#### ⚠️ Supabase Auth 陷阱
- [ ] **是否使用了正确的 Supabase client?**
  - Server Components: `import { createClient } from '@/lib/supabase/server'`
  - Client Components: `import { createClient } from '@/lib/supabase/client'`
  - ❌ 不要直接使用 `createServerClient` 或 `createBrowserClient`

#### ⚠️ Router Cache 陷阱
- [ ] **动态路由是否设置了 `dynamic = 'force-dynamic'`?**
- [ ] **是否在需要时调用了 `revalidatePath()`?**

### 第 5 步: 隔离问题 (20 分钟)
- [ ] 创建最小复现用例
- [ ] 逐步注释代码,找到触发问题的最小代码块
- [ ] 对比工作版本和问题版本的差异

---

## 🚫 常见错误做法 (避免!)

### ❌ 不要做:
1. **猜测修改** - 没有诊断就改代码
2. **批量修改** - 一次改多个地方,无法定位真正的修复
3. **跳过日志检查** - 直接假设问题在某个地方
4. **忽略警告** - "反正能跑就行"

### ✅ 应该做:
1. **系统化诊断** - 按检查清单逐项排查
2. **单点修改** - 一次只改一个地方,测试后再继续
3. **日志优先** - 先看服务器和浏览器日志
4. **修复警告** - 警告可能是潜在 bug

---

## 📊 本次问题的教训

### 问题: 登出后 Landing Page 仍显示 Dashboard 按钮

### 错误的调试路径 (浪费时间):
1. ❌ 修改 `logoutAction` 重定向路径
2. ❌ 修改 `page.tsx` 的 Supabase client
3. ❌ 添加更多 `revalidatePath()`

### 正确的调试路径 (应该一开始就做):
1. ✅ **查看服务器日志** → 发现没有登出日志!
2. ✅ 立即定位到 Server Action 调用方式问题
3. ✅ 修复 `useTransition` 包装
4. ✅ 5 分钟解决

### 关键经验:
> **如果预期应该看到服务器日志,但实际没有 → 说明代码根本没执行!**

---

## 🛠️ 快速诊断命令

### 清除所有缓存并重启
```bash
# 清除 Next.js 缓存
rm -rf .next

# 清除 node_modules 缓存 (极端情况)
rm -rf node_modules/.cache

# 重启开发服务器
pnpm dev
```

### 检查 Supabase Auth 状态
```typescript
// 添加到 page.tsx 或任何 Server Component
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

### 检查 Cookies
```typescript
// 添加到 Server Component
const cookieStore = await cookies()
const allCookies = cookieStore.getAll()
console.log('All cookies:', allCookies)
```

---

## 📝 调试模板

### Server Action 调试模板
```typescript
export async function myAction() {
  console.log('[myAction] START')

  try {
    // 你的代码
    console.log('[myAction] Step 1 完成')

    // 更多代码
    console.log('[myAction] Step 2 完成')

    console.log('[myAction] SUCCESS')
  } catch (error) {
    console.error('[myAction] ERROR:', error)
    throw error
  }
}
```

### Client Component 调试模板
```typescript
'use client'

export function MyComponent() {
  console.log('[MyComponent] 渲染')

  const handleClick = () => {
    console.log('[MyComponent] handleClick 触发')
    // 你的代码
  }

  return <button onClick={handleClick}>Click</button>
}
```

---

## 🎯 何时向 AI 求助

### 在求助前必须完成:
1. ✅ 完成前 3 步检查清单
2. ✅ 收集了服务器日志和浏览器 Console 截图
3. ✅ 尝试了常见陷阱检查
4. ✅ 能够稳定复现问题

### 提供给 AI 的信息:
```
问题描述: [简洁描述]
复现步骤: [1, 2, 3...]
预期行为: [应该发生什么]
实际行为: [实际发生什么]

服务器日志: [粘贴完整日志]
浏览器 Console: [截图或粘贴]
相关代码: [最小复现代码]

已尝试的方案:
1. [方案 1] - [结果]
2. [方案 2] - [结果]
```

---

## 📚 参考资料

- [Next.js Server Actions 文档](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase SSR 最佳实践](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [项目 CLAUDE.md](./CLAUDE.md) - 项目特定的开发指南

---

**记住**: 好的调试习惯可以节省 90% 的时间和 Token! 🚀
