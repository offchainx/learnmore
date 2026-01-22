# Vibe Kanban 任务创建模板

**目的**: 确保AI按照架构约束执行，避免"瞎写代码"
**使用方法**: 复制对应模板到 Vibe Kanban 任务描述

---

## 📋 模板1: Server Action 开发任务

```markdown
## Task: 实现 [功能名称] Server Action

### 📐 架构约束
**必读文档**:
- `/docs/ARCHITECTURE_CONSTRAINTS.md` (架构约束)
- `/docs/stories/backlog/story-043-practice-center-production.md` (功能规范)

### 🎯 任务目标
[从 Story-043 复制具体的任务描述]

例如:
实现 `getChapterWithStats` 方法，查询章节并计算用户掌握度

### ✅ 必须遵循
1. **文件位置**: `src/actions/practice/data-service.ts`
2. **模板**: 使用 `ARCHITECTURE_CONSTRAINTS.md` 中的 "Server Action 模板"
3. **输入验证**: 使用 Zod Schema
4. **错误处理**: 完整的 try-catch
5. **日志前缀**: `[Data Service]`
6. **类型安全**: 返回 `ActionResult` 类型

### 📝 实现要求
```typescript
/**
 * 查询章节及用户掌握度
 * @param chapterId - 章节 ID
 * @param userId - 用户 ID
 * @returns 章节信息 + 掌握度数据
 */
export async function getChapterWithStats(
  chapterId: string,
  userId: string
): Promise<ActionResult<ChapterWithStats>> {
  // 1. 验证用户身份
  // 2. 查询章节基本信息（使用 Prisma）
  // 3. 查询用户答题记录（最近 50 次）
  // 4. 调用 calculateChapterMastery 计算掌握度
  // 5. 返回 { success: true, data: {...} }
}
```

### 🧪 测试要求
创建测试文件: `src/actions/practice/__tests__/data-service.test.ts`

```typescript
describe('getChapterWithStats', () => {
  it('should return chapter with mastery level', async () => {
    // Test implementation
  })

  it('should handle non-existent chapter', async () => {
    // Test edge case
  })
})
```

### 🔍 自检清单
提交前确认:
- [ ] 使用了正确的文件路径
- [ ] 遵循了 Server Action 模板
- [ ] 包含完整的 TypeScript 类型
- [ ] 包含 JSDoc 注释
- [ ] 添加了单元测试
- [ ] 使用了 `[Data Service]` 日志前缀
- [ ] 移除了所有 Mock 数据

### 🚫 禁止行为
- ❌ 不要在组件中直接调用 Prisma
- ❌ 不要使用硬编码的 Mock 数据
- ❌ 不要忽略错误处理
- ❌ 不要超过 100 行（如果太长，拆分为多个函数）
```

---

## 📋 模板2: 组件开发任务

```markdown
## Task: 创建 [组件名称] 组件

### 📐 架构约束
**必读文档**: `/docs/ARCHITECTURE_CONSTRAINTS.md` 的 "组件规范" 部分

### 🎯 任务目标
[从 Story-043 复制具体的任务描述]

例如:
创建 `SmartDrillMode.tsx` 组件，实现智能刷题模式UI

### ✅ 必须遵循
1. **文件位置**: `src/components/practice/modes/SmartDrillMode.tsx`
2. **模板**: 使用 "Client Component 模板"
3. **状态管理**: useState + useEffect
4. **错误处理**: toast.error 显示错误
5. **加载状态**: 显示 LoadingSpinner
6. **类型安全**: 完整的 TypeScript Props 定义

### 📝 实现要求
```typescript
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getSmartDrillQuestions } from '@/actions/practice/recommendation'
import { QuizSession } from '@/components/practice/session/QuizSession'

interface SmartDrillModeProps {
  userId: string
  subjectId: string
}

export function SmartDrillMode({ userId, subjectId }: SmartDrillModeProps) {
  // 1. 状态管理
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 2. 数据获取
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        const result = await getSmartDrillQuestions(userId, subjectId, 10)

        if (result.success) {
          setQuestions(result.data)
        } else {
          setError(result.error || 'Failed to load questions')
          toast.error(result.error)
        }
      } catch (err) {
        console.error('[Component] SmartDrillMode error:', err)
        setError('Unexpected error')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [userId, subjectId])

  // 3. 渲染状态
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  // 4. 主界面
  return (
    <QuizSession
      questions={questions}
      mode="SMART_DRILL"
      showFeedback={true}
      allowNavigation={true}
    />
  )
}
```

### 🎨 UI 要求
- 加载状态: 使用 Shadcn Skeleton
- 错误状态: 使用 Shadcn Alert
- 成功状态: 渲染 QuizSession 组件
- 响应式: 移动端适配（使用 Tailwind responsive classes）

### 🔍 自检清单
- [ ] 文件位置正确
- [ ] 包含 'use client' 指令
- [ ] 完整的加载/错误状态处理
- [ ] TypeScript Props 类型定义
- [ ] 无 Console Errors/Warnings
- [ ] 组件代码 < 200 行（否则拆分）

### 🚫 禁止行为
- ❌ 不要在组件中直接调用 Prisma
- ❌ 不要使用 Mock 数据
- ❌ 不要忽略加载/错误状态
- ❌ 不要在组件中写复杂业务逻辑（应该在 Server Action）
```

---

## 📋 模板3: 算法实现任务

```markdown
## Task: 实现 [算法名称]

### 📐 架构约束
**必读文档**: `/docs/ARCHITECTURE_CONSTRAINTS.md` 的 "掌握度计算标准" 部分

### 🎯 任务目标
[从 Story-043 复制具体的算法逻辑]

例如:
实现 `calculateChapterMastery` 算法，使用指数衰减计算掌握度

### ✅ 必须遵循
1. **文件位置**: `src/lib/practice/mastery.ts`
2. **算法标准**: 严格遵循 `ARCHITECTURE_CONSTRAINTS.md` 中的公式
3. **返回类型**: `MasteryLevel` 枚举（0-3）
4. **参数**: `UserAttempt[]`
5. **测试覆盖**: 100%

### 📝 实现要求
**禁止自定义算法！必须使用以下公式**:

```typescript
export function calculateChapterMastery(attempts: UserAttempt[]): MasteryLevel {
  if (attempts.length === 0) return MasteryLevel.NOT_STARTED

  // 指数衰减公式（λ = 0.1，禁止修改）
  const now = new Date()
  let weightedSum = 0
  let totalWeight = 0

  attempts.forEach(attempt => {
    const daysSince = (now.getTime() - attempt.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const weight = Math.exp(-0.1 * daysSince)  // ← 禁止修改此值

    weightedSum += (attempt.isCorrect ? 1 : 0) * weight
    totalWeight += weight
  })

  const correctRate = (weightedSum / totalWeight) * 100

  // 分级标准（禁止修改）
  if (correctRate >= 80) return MasteryLevel.ADVANCED
  if (correctRate >= 60) return MasteryLevel.INTERMEDIATE
  return MasteryLevel.BEGINNER
}
```

### 🧪 测试要求
**必须通过所有测试用例**:

```typescript
// src/lib/practice/__tests__/mastery.test.ts

describe('calculateChapterMastery', () => {
  it('should return NOT_STARTED for empty attempts', () => {
    expect(calculateChapterMastery([])).toBe(MasteryLevel.NOT_STARTED)
  })

  it('should return ADVANCED for 90% recent correct rate', () => {
    const attempts = generateMockAttempts(10, 0.9, 0) // 10题，90%正确，今天
    expect(calculateChapterMastery(attempts)).toBe(MasteryLevel.ADVANCED)
  })

  it('should return BEGINNER for 50% correct rate', () => {
    const attempts = generateMockAttempts(10, 0.5, 0)
    expect(calculateChapterMastery(attempts)).toBe(MasteryLevel.BEGINNER)
  })

  it('should prioritize recent attempts (exponential decay)', () => {
    const oldAttempts = generateMockAttempts(10, 0.5, 30)  // 30天前，50%
    const newAttempts = generateMockAttempts(5, 0.9, 0)    // 今天，90%
    const combined = [...oldAttempts, ...newAttempts]

    // 应该偏向近期的 90%，结果应该是 ADVANCED
    expect(calculateChapterMastery(combined)).toBe(MasteryLevel.ADVANCED)
  })
})
```

### 🔍 自检清单
- [ ] 使用了正确的指数衰减公式（λ = 0.1）
- [ ] 分级标准正确（80/60 分界线）
- [ ] 包含完整的 JSDoc 注释
- [ ] 测试覆盖率 100%
- [ ] 所有边界情况都有测试

### 🚫 禁止行为
- ❌ 不要修改指数衰减参数（λ = 0.1）
- ❌ 不要修改分级标准（80/60）
- ❌ 不要使用简单平均（必须使用加权平均）
```

---

## 📋 模板4: 数据库 Schema 修改任务

```markdown
## Task: 扩展 [表名] Schema

### 📐 架构约束
**必读文档**: `/docs/stories/backlog/story-043-practice-center-production.md` 的 "A1: 数据库Schema扩展"

### 🎯 任务目标
为 `Chapter` 和 `ExamRecord` 表添加新字段，支持练习模式管理

### ✅ 必须遵循
1. **文件**: `prisma/schema.prisma`
2. **命名规范**: snake_case (数据库字段), camelCase (Prisma 字段)
3. **必须添加 @map**: 所有新字段
4. **必须添加索引**: 如果字段用于查询

### 📝 实现要求

```prisma
// 1. 扩展 Chapter 表
model Chapter {
  // ... 现有字段

  // 🆕 新增字段（用于缓存掌握度）
  totalQuestions  Int       @default(0) @map("total_questions")
  avgDifficulty   Float?    @map("avg_difficulty")
  cachedMastery   Json?     @map("cached_mastery")        // { userId: masteryLevel }
  lastCacheUpdate DateTime? @map("last_cache_update")
}

// 2. 扩展 ExamRecord 表
model ExamRecord {
  // ... 现有字段

  // 🆕 新增字段（支持练习模式标识）
  mode      PracticeMode @default(MOCK_EXAM)
  subjectId String?      @map("subject_id") @db.Uuid

  // 🆕 添加关系
  subject Subject? @relation(fields: [subjectId], references: [id])
}

// 3. 新增枚举
enum PracticeMode {
  SMART_DRILL
  ERROR_WIPER
  MOCK_EXAM
  CHAPTER_DRILL
}
```

### 🚀 执行步骤
```bash
# 1. 更新 schema.prisma（如上）

# 2. 生成 migration
npx prisma migrate dev --name add_practice_mode_fields

# 3. 应用到数据库
npx prisma db push

# 4. 更新 Prisma Client
npx prisma generate

# 5. 验证类型（应该无错误）
pnpm tsc --noEmit
```

### 🔍 自检清单
- [ ] 所有新字段都有 @map 映射
- [ ] 默认值合理（使用 @default）
- [ ] 外键关系正确（使用 @relation）
- [ ] 枚举值清晰易懂
- [ ] Migration 文件已生成
- [ ] TypeScript 类型已更新

### 🚫 禁止行为
- ❌ 不要直接修改生产数据库（必须先生成 migration）
- ❌ 不要删除现有字段（只能添加）
- ❌ 不要使用驼峰命名数据库字段（必须 snake_case）
```

---

## 🎯 Vibe Kanban 使用流程

### Step 1: 创建任务
在 Vibe Kanban 中创建新任务，粘贴对应模板

### Step 2: 任务描述示例

```markdown
## Task: 实现 getSmartDrillQuestions 推荐算法

### 📐 架构约束
**必读文档**:
- `/docs/ARCHITECTURE_CONSTRAINTS.md` (架构约束)
- `/docs/stories/backlog/story-043-practice-center-production.md` (模块B1)

### 🎯 任务目标
实现智能推荐算法，根据用户错题历史推荐练习题目

### ✅ 必须遵循
[复制"模板1: Server Action 开发任务"内容]

### 📝 实现要求
按照 Story-043 模块B1 的算法逻辑:
- 50% 来自错题章节
- 30% 来自掌握度<80%的章节
- 20% 来自新章节
- 难度: 用户等级 ± 1 星
- 排除: 7天内做过的题

[复制 Story-043 中的伪代码]
```

### Step 3: AI 执行检查点

AI 在生成代码前会看到:
1. ✅ 架构约束文档路径
2. ✅ 必须遵循的规范
3. ✅ 禁止行为列表
4. ✅ 自检清单

---

## 💡 Pro Tips

### Tip 1: 使用"约束引用"而非"完整复制"
```markdown
# ❌ 不好（太长）
在每个任务中复制 ARCHITECTURE_CONSTRAINTS.md 的全部内容

# ✅ 好（简洁）
**必读文档**: `/docs/ARCHITECTURE_CONSTRAINTS.md` 的 "Server Action 模板" 部分
```

### Tip 2: 任务描述中添加"禁止行为"
即使架构文档中已有，重复强调关键禁止项:
```markdown
### 🚫 此任务特别禁止
- ❌ 不要使用 Mock 数据
- ❌ 不要超过 200 行代码
```

### Tip 3: 提供"参考示例"
从 ARCHITECTURE_CONSTRAINTS.md 复制好的示例:
```markdown
### 📚 参考示例
见 `/docs/ARCHITECTURE_CONSTRAINTS.md` 的 "✅ 好的示例" 部分
```

### Tip 4: 要求 AI 输出"实施计划"
在任务末尾添加:
```markdown
### 📝 AI 请先输出实施计划
在写代码前，请输出:
1. 文件结构（哪些文件需要创建/修改）
2. 核心逻辑步骤（3-5个步骤）
3. 可能的风险点

等待我确认后再开始编码。
```

---

**最后更新**: 2026-01-22
**维护者**: Claude Code
