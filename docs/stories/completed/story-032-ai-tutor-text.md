# Story-032: AI Text Tutor

**状态**: Completed ✅
**优先级**: P2
**前置任务**: Story-029

## 1. 目标
利用 Gemini API 提供基于文本的题目解析和个性化指导。**注意：实施严格的 Token 配额控制**。

## 2. 任务拆解
- [x] **Gemini Client**:
    - 封装 Gemini 调用服务 (`src/lib/gemini.ts`),设置 System Prompt (角色：苏格拉底式导师)。
- [x] **Text Explanation**:
    - 在错题本或 Quiz 结果页,添加 "Ask AI" 按钮 (`src/components/ai/AiTutorButton.tsx`)。
    - 点击后,发送题目上下文 + 用户错误答案,请求 AI 解析 (Markdown 格式)。
    - 流式 (Streaming) 显示 AI 回答 (Implemented in `/api/ai-tutor`)。
- [x] **Quota System**:
    - 调用前检查 `User.aiTokenBalance` (Implemented in `/api/ai-tutor`)。
    - 调用后扣除 Token (Atomic transaction)。
    - 如果配额不足,提示升级 (UI handles 403 response)。

## 3. 验收标准
- [x] 点击 "Ask AI",能收到针对性的题目解析。
- [x] 解析支持 LaTeX 公式渲染 (Used `react-markdown` with `rehype-katex`)。
- [x] 配额用尽时无法调用 (Validated via transaction logic)。

## 4. 实现总结

### 关键文件
- `src/lib/gemini.ts` - Gemini SDK 初始化和系统指令
- `src/app/api/ai-tutor/route.ts` - AI Tutor API 路由 (流式响应)
- `src/components/ai/AiTutorButton.tsx` - AI 导师按钮组件
- `src/app/error-book/ErrorBookPageClient.tsx:15,256-262` - 错题本集成
- `prisma/schema.prisma:22` - `User.aiTokenBalance` 字段

### 核心实现亮点

1. **Gemini Client 封装**:
   - **SDK**: `@google/genai` (官方 SDK)
   - **系统指令**: 苏格拉底式教学法
     - 鼓励学生独立思考
     - 识别错误背后的误解
     - 提供引导式提示,不直接给答案
     - 支持 LaTeX 公式 ($...$)
   - **模型选择**: `gemini-1.5-flash` (速度和成本优化)
   - **温度参数**: 0.7 (平衡创造性和准确性)

2. **AI Tutor API 路由**:
   - **权限控制**:
     - 使用 `getCurrentUser()` 验证身份
     - Prisma Transaction 确保原子性检查和扣费
   - **配额系统**:
     - ULTIMATE/ADMIN: 无限调用
     - 其他用户: 扣除 `aiTokenBalance` (默认 5)
     - 不足时返回 403 状态码
   - **上下文构建**:
     - 科目、章节、难度
     - 题目内容和正确答案
     - 用户错误答案
     - 参考解析 (如有)
   - **流式响应**:
     - 使用 `generateContentStream` 流式生成
     - ReadableStream 包装 Gemini 响应
     - 逐块返回文本 (TextEncoder)

3. **AiTutorButton 组件**:
   - **UI 交互**:
     - 按钮: 渐变背景 (indigo/purple)
     - 展开卡片: 动画进入效果
     - 关闭按钮: 右上角 X
   - **流式显示**:
     - ReadableStream reader 逐块读取
     - TextDecoder 解码 UTF-8
     - 实时追加到 response state
   - **错误处理**:
     - 403: Toast 提示配额不足,建议升级
     - 其他错误: Toast 通用错误提示
   - **LaTeX 渲染**:
     - `react-markdown` + `remark-math` + `rehype-katex`
     - 自动渲染数学公式

4. **错题本集成**:
   - **显示条件**:
     - 复习模式: 始终显示
     - 练习模式: 答错后显示
   - **位置**: 题目底部导航区域
   - **传参**: `questionId` + `userAnswer`

### 质量检查
- ✅ ESLint: 0 errors, warnings 仅 console.warn (可接受)
- ✅ TypeScript: 无类型错误
- ✅ Build: 生产构建成功
- ✅ 代码质量: Gemini SDK + Streaming + Prisma Transaction

## 5. 遇到的问题与解决方案
- **问题**: Gemini SDK `chunk.text` 类型不明确 (可能是 function 或 property)
- **解决**: 使用 `@ts-ignore` 和条件判断兼容两种情况
- **问题**: 配额扣费需要原子性
- **解决**: 使用 `Prisma.$transaction` 确保检查和扣费在同一事务中

## 6. 环境变量配置

需要配置以下环境变量:

```env
# Gemini API
GEMINI_API_KEY=your_api_key_here
```

获取 API Key:
1. 访问 https://aistudio.google.com/apikey
2. 创建新的 API Key
3. 添加到 `.env.local`

## 7. 配额管理策略

### 默认配额:
- 新用户: 5 tokens (免费)
- PRO: 20 tokens/day (可考虑每日重置)
- ULTIMATE: 无限

### 未来优化建议:
1. **每日重置**: 使用 Cron Job 每天凌晨重置 PRO 用户配额
2. **购买 Tokens**: 允许用户单独购买 AI Token 包
3. **成本优化**:
   - 缓存常见题目的 AI 解析
   - 使用更便宜的模型 (如 gemini-1.5-flash-8b)
4. **使用统计**: 记录每次调用的 token 消耗 (从 Gemini 响应中提取)

## 8. 用户体验优化

### 已实现:
- ✅ 流式显示 (实时看到 AI 生成过程)
- ✅ Loading 状态 (Thinking...)
- ✅ 错误提示 (Toast)
- ✅ LaTeX 公式渲染

### 未来可优化:
- ⚪ Token 余额显示 (Settings 页面)
- ⚪ AI 对话历史 (保存到数据库)
- ⚪ 多轮对话 (追问功能)
- ⚪ AI 解析点赞/踩功能 (质量反馈)
