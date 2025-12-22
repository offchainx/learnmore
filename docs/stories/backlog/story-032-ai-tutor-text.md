# Story-032: AI Text Tutor

**状态**: Backlog ⚪
**优先级**: P2
**前置任务**: Story-029

## 1. 目标
利用 Gemini API 提供基于文本的题目解析和个性化指导。**注意：实施严格的 Token 配额控制**。

## 2. 任务拆解
- [ ] **Gemini Client**:
    - 封装 Gemini 调用服务，设置 System Prompt (角色：苏格拉底式导师)。
- [ ] **Text Explanation**:
    - 在错题本或 Quiz 结果页，添加 "Ask AI" 按钮。
    - 点击后，发送题目上下文 + 用户错误答案，请求 AI 解析（Markdown 格式）。
    - 流式 (Streaming) 显示 AI 回答。
- [ ] **Quota System**:
    - 调用前检查 `User.ai_token_quota`。
    - 调用后扣除 Token。
    - 如果配额不足，提示升级。

## 3. 验收标准
- [ ] 点击 "Ask AI"，能收到针对性的题目解析。
- [ ] 解析支持 LaTeX 公式渲染。
- [ ] 配额用尽时无法调用。
