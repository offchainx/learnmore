# Story-047: AI Copilot 交互界面 (Context-Aware AI Chat)

**阶段**: Phase 8: Core AI Experience
**目标**: 构建一个上下文感知的、支持流式输出与富文本渲染的 AI 助手，作为“智学版”的核心交付载体。
**预估时间**: 45-55 Hours
**Story Points**: 40
**前置依赖**: Story-044 (Content Pipeline), Story-045 (Permission System)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前痛点
- ⚠️ **断裂的体验**: 学生遇到难题时，必须复制题目 -> 打开 ChatGPT -> 粘贴 -> 提问。这个过程打断了心流。
- ⚠️ **缺乏上下文**: 通用 AI 不知道这道题的标准答案、解析步骤或用户的历史错误模式，回答可能跑偏。
- ⚠️ **交互单一**: 目前的 AI 只是后台生成静态报告（Story-043），缺乏实时互动。

### 目标状态
- ✅ **侧边栏/悬浮窗模式**: 在练习界面 (Quiz View) 右侧滑出，不遮挡题目。
- ✅ **自动上下文注入 (Auto-Context)**: AI 自动读取当前题目内容、选项、用户刚提交的错误答案，无需用户手动输入。
- ✅ **流式响应 (Streaming)**: 打字机效果，降低感知延迟。
- ✅ **富文本渲染**: 完美支持 LaTeX 公式、Markdown 表格、代码块。
- ✅ **预设追问 (Quick Prompts)**: "给我一个提示"、"解释这个公式"、"举个类似的例子"。

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 交互流程

```
[Client: Quiz Page]
      |
      | User clicks "Ask AI" -> Opens <AICopilotPanel />
      |
[AICopilotPanel]
      | 1. Collect Context: { questionId, userCode, currentError }
      | 2. Check Permission (Story-045: 'ai.chat')
      |      |-- Denied -> Show <UpsellModal />
      |      |-- Allowed -> Show Chat Interface
      |
      | 3. User sends "Give me a hint"
      |
[Server Action: streamAIChat]
      |
      |-- 4. Load System Prompt (Persona: Socratic Tutor)
      |-- 5. Load Question Data (Content + Explanation)
      |-- 6. Call LLM (OpenAI/Anthropic) with stream: true
      |
[Client]
      |-- 7. Receive chunks -> Render Markdown/LaTeX in real-time
```

### 2.2 技术栈选择
- **UI Framework**: `ai/rsc` (Vercel AI SDK) 或原生 `useChat` Hook。推荐使用 **Vercel AI SDK Core** 以获得最佳的 Next.js 集成体验。
- **Streaming**: React Server Components (RSC) Streaming。
- **Rendering**: `react-markdown`, `rehype-katex` (数学公式), `remark-gfm`。

---

## 🎯 3. Implementation Tasks (实施任务拆解)

### ⚠️ 策略说明
我们将 AI Copilot 设计为一个**全局可复用的组件**，但主要挂载在 `Practice` 页面。

---

## 📦 Task A: UI 框架与流式基础 (The Shell)

### 🎯 目标
搭建聊天窗口 UI，打通前后端流式通信，支持 Markdown/LaTeX 渲染。

### 📄 核心文件
- `src/components/ai/CopilotPanel.tsx` (主容器)
- `src/components/ai/ChatBubble.tsx` (消息气泡)
- `src/components/ai/MarkdownRenderer.tsx` (渲染器)
- `src/app/api/chat/route.ts` (Edge Runtime API Route)

### ⚡ Server Actions / API
- `POST /api/chat`: 标准 AI SDK 端点

### 📘 TypeScript 定义
- `Message`: { id, role, content, createdAt }

### ✅ 交付物清单
- [ ] A1: `CopilotPanel` 侧边栏组件 (支持展开/收起)
- [ ] A2: 集成 Vercel AI SDK `useChat`
- [ ] A3: `MarkdownRenderer` 支持 LaTeX ($$x^2$$)
- [ ] A4: 简单的 Echo API (用于测试流式输出)

### 🔧 详细实施指南

#### A3: MarkdownRenderer
必须处理好 LaTeX。使用 `react-markdown` 配合 `rehype-katex`。
```tsx
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className="prose dark:prose-invert"
    >
      {content}
    </ReactMarkdown>
  )
}
```

---

## 📦 Task B: 上下文感知与 Prompt Engineering (The Brain)

### 🎯 目标
让 AI 变得“聪明”，知道用户在问什么题。

### 📄 核心文件
- `src/lib/ai/prompts.ts` (Prompt 模板管理)
- `src/lib/ai/context-loader.ts` (数据获取)
- `src/app/api/chat/route.ts` (升级逻辑)

### ✅ 交付物清单
- [ ] B1: `ContextLoader` 工具 (根据 questionId 拉取题目内容、正确答案、解析)
- [ ] B2: System Prompt 设计 (苏格拉底式教学法：不要直接给答案，要引导)
- [ ] B3: API 接收 `body: { questionId, ... }` 并注入 Prompt

### 🔧 详细实施指南

#### B2: System Prompt 示例
```typescript
export const SYSTEM_PROMPT = `
You are an expert AI Tutor for middle school students.
Your goal is to guide the student to the answer, NOT to give the answer directly.
Use the Socratic method: ask guiding questions.

Context:
- Question: {{question_content}}
- Correct Answer: {{correct_answer}}
- Explanation: {{explanation}}

Current Student Error (if any): {{student_wrong_answer}}

Instructions:
1. If the student asks for a hint, give a conceptual clue.
2. If the student is frustrated, explain the first step of the solution.
3. Always format math formulas using LaTeX (e.g. $E=mc^2$).
`
```

---

## 📦 Task C: 交互增强 (UX Enhancements)

### 🎯 目标
降低提问门槛，提供快捷指令。

### 📄 核心文件
- `src/components/ai/QuickPrompts.tsx`
- `src/components/ai/ThinkingIndicator.tsx`

### ✅ 交付物清单
- [ ] C1: 快捷指令芯片 (Chips) - "给我提示", "解释概念", "详细步骤"
- [ ] C2: 思考中动画 (Thinking...)
- [ ] C3: 错误处理 (网络断开、配额耗尽)

### 🔧 详细实施指南

#### C1: Quick Prompts
在输入框上方显示一排按钮。点击后自动发送消息。
```tsx
const PROMPTS = [
  { label: '💡 给我一个提示', value: '请给我关于这道题的一个提示，不要直接告诉我答案。' },
  { label: '📖 解释相关概念', value: '这道题涉及哪些知识点？请简要解释一下。' },
]
```

---

## 📦 Task D: 权限与配额集成 (Story-045 Integration)

### 🎯 目标
确保只有 Smart Plus 用户能畅用，其他用户受到限制或引导。

### 📄 核心文件
- `src/components/ai/CopilotPanel.tsx` (修改)
- `src/actions/ai/quota.ts` (新建)

### ✅ 交付物清单
- [ ] D1: 权限检查 (Starter/Standard 用户打开面板时显示 `FeatureLock` 或 `UpsellModal`)
- [ ] D2: (可选) 配额限制 - 如果我们对 Standard 用户开放有限次数 (例如每天 3 次)

### 🔧 详细实施指南

#### D1: Integration
```tsx
const { hasPermission } = usePermissions() // Custom hook from Story-045

if (!hasPermission('ai.chat')) {
  return (
    <div className="h-full flex items-center justify-center">
      <UpsellModal trigger="AI_CHAT" />
    </div>
  )
}
```

---

## ✅ 4. Verification Plan (验收标准)

### 4.1 功能验收
- [ ] **渲染测试**: 输入复杂的 LaTeX 公式 `$$\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`，确保前端正确渲染为数学符号。
- [ ] **上下文测试**: 打开第 A 题，问“这题选什么”，AI 应该能回答关于第 A 题的内容；切换到第 B 题，AI 应该自动更新上下文。
- [ ] **流式测试**: 消息应该是逐字出现的，而不是等待 3 秒后一次性出现。

### 4.2 边界测试
- [ ] **网络中断**: 在生成过程中断网，UI 应提示重试。
- [ ] **超长对话**: 连续对话 20 轮，确保 Context Window 不会爆掉（需在 API 层做截断处理）。

---

## 📅 5. Execution Roadmap

1.  **Day 1: Task A (Shell)** - 跑通 "Hello World" 的流式对话。
2.  **Day 2: Task B (Brain)** - 对接真实题目数据，调试 System Prompt。
3.  **Day 3: Task C (UX)** - 加上 Markdown 渲染和快捷指令。
4.  **Day 4: Task D (Permission)** - 加上付费墙。

---

## 📝 开发备注
- **Cost Control**: AI Token 消耗是真金白银。务必在 API Route 中限制 Max Tokens (例如 500)，并限制历史记录长度 (例如只带最近 5 轮对话)。
- **Latency**: 尽量使用 Edge Function (`runtime: 'edge'`) 部署 API Route，以获得最快的 TTFB (Time To First Byte)。
