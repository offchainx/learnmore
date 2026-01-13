# Story-010-practice-center-revamp: 练习中心重构与AI升级

**阶段**: Phase 4: Core Product (Revamped)
**目标**: 全面升级练习中心逻辑，集成AI智能刷题、PDF试卷解析及游戏化复习模式。
**预估时间**: 24-32 Hours
**Story Points**: 21
**前置依赖**: Story-029 (基础练习逻辑), Story-033 (AI诊断)
**负责人**: _待分配_

---

## 1. Objectives (核心目标)

- [ ] **智能解析 (Smart Document Parsing)**:
    - **支持格式**: PDF 文档 (`.pdf`) 与 图片 (`.jpg`, `.png`, `.webp`)。
    - **解析能力**: 自动拆解为问题、答案、选项及解析。
    - **深度分析**: 能够区分正确选项的原因（Why correct）和错误干扰项的原因（Why wrong）。
- [ ] **核心题型适配 (Core Question Support)**:
    - 完善 **单选题 (Single Choice)** UI与逻辑。
    - 完善 **多选题 (Multiple Choice)** UI与逻辑。
    - 完善 **填空题 (Fill-in-the-Blank)** UI与逻辑。
- [ ] **三大练习模式 (Drill Modes)**:
    - **Smart Drill (智能刷题)**: 基于用户历史数据的自适应难度推荐。
    - **Error Wiper (错题消消乐)**: 游戏化的错题复习模式（连对N次消除）。
    - **Mock Arena (模拟考场)**: 包含全屏倒计时、无即时反馈、最终生成报告的模拟考试。
- [ ] **数据与配置 (Data & Logic)**:
    - 练习题数据库字段扩展（支持结构化解析）。
    - 全局倒计时组件 (Countdown Timer)。
- [ ] **AI 与 分析 (AI & Analytics)**:
    - **Knowledge Hive (知识蜂巢)**: 知识点掌握度的蜂巢状可视化图表。
    - **Exam Forecast (考分预测)**: 基于近期练习表现的成绩预测。

## 2. Tech Plan (技术方案)

### 2.1. 文档/图片 -> 题目转换流
- **技术栈**: 
    - PDF: `pdf-parse` (Node.js) 用于提取文本，或 `pdf-lib`/`canvas` 转图片。
    - Image: 直接通过 Gemini Vision API 处理。
    - AI: Google Gemini 1.5 Flash (Vision/Text)。
- **流程**:
    1.  用户上传文件 (PDF 或 图片)。
    2.  服务端处理:
        - 若为 PDF: 尝试提取文本；若文本稀疏（扫描件），则将其转换为图像序列。
        - 若为 图片: 直接压缩/格式化。
    3.  LLM Prompt: "分析上传的试卷/题目图像。提取题目内容。返回 JSON 格式 `{ content, type, options, answer, explanation_correct, explanation_wrong_distractors }`。"
    4.  预览界面: 用户在入库前可编辑/确认提取结果。

### 2.2. 刷题引擎逻辑
- **Smart Drill (智能刷题)**:
    - 算法: 查询 `UserAttempt` 中 `isCorrect = false` 的记录 -> 找到关联 `Chapter` -> 在该章节中筛选难度匹配 (`User.level` ± 1) 的新题。
- **Error Wiper (错题消消乐)**:
    - 逻辑: 展示 `ErrorBook` 内容。连续答对 3 次 -> 从错题本移除 (或设置 `masteryLevel = 3`)。
    - UI: 卡片堆叠效果 (Stack) 或 "擦除" 动画。
- **Mock Arena (模拟考场)**:
    - 逻辑: 选择 `Subject` -> 随机抽取 20 题 (权重: 30% 简单, 50% 中等, 20% 困难)。
    - 限制: 答题过程中无反馈，时间结束自动提交。

### 2.3. 数据可视化
- **Knowledge Hive (知识蜂巢)**:
    - 库: D3.js 或 React Flow / Recharts。
    - 数据: `Chapter` 节点。颜色 = 该章节平均正确率。大小 = 练习总量。
- **Exam Forecast (考分预测)**:
    - 逻辑: 简单线性回归。`预测分 = (平均练习正确率 * 0.7) + (课程完成率 * 0.3)` (仅作示例，需调优)。

---

## 3. Implementation Steps (实施步骤)

### Phase 1: 数据库与类型系统增强
- [ ] 检查 `Question` Schema 是否支持结构化的“分项解析”。
- [ ] 如有必要，更新 `prisma/schema.prisma`。
- [ ] 创建 `QuestionFactory` 用于开发时生成三种题型的 Mock 数据。

### Phase 2: 三大模式开发 (逻辑 + UI)
- [ ] **Smart Drill**: 实现 `SmartDrillPage` 页面及推荐算法。
- [ ] **Error Wiper**: 实现 `ErrorWiperPage` 及“消除”动画交互。
- [ ] **Mock Arena**: 实现 `MockExamPage`，包含 `CountdownTimer` 和 `SubmissionSummary`。

### Phase 3: 智能解析引擎 (Smart Parser) ✅ 已完成
- [x] 后端: 实现 `parseQuestionImage` Server Action (集成 Gemini 2.0 Flash + JSON 模式)。
- [x] 服务: 实现题目识别逻辑，支持单图多题解析。
- [x] 前端: 实现上传组件 (支持 JPG/PNG/HEIC 格式)。
- [x] 前端: 实现 `QuestionEditor` 预览与编辑页。
- [x] 数据库: 实现 `createQuestion` 保存逻辑 (自动创建 General/Imported Questions 分类)。
- [x] 错误处理: 完整的错误提示（图片加载、解析失败、保存验证）。
- [x] **已修复**: 图片预览失效 (Base64 过大、HEIC 格式不兼容)。
- [x] **已优化**: Prompt 改进，提取完整选项文本而非仅标签。
- [x] **已优化**: Answer/Explanation 为空时的友好提示和 placeholder。

### Phase 4: 分析与优化 (待启动)
- [ ] 实现 `KnowledgeHive` 可视化组件。
- [ ] 实现 `ExamForecast` 预测组件。
- [ ] 移动端适配 (Mobile Adaptation)。

---

## 6. 开发笔记 (Development Notes)

### 6.1. AI 解析架构
- **模型**: `gemini-2.0-flash`
- **输出控制**: 使用 `responseMimeType: "application/json"` 确保返回标准数组格式。
- **数据流**: `File` -> `FileReader (Base64)` -> `Server Action` -> `Gemini API` -> `Structured JSON` -> `Frontend State`.

### 6.2. 调试记录 (2026-01-13)

#### ✅ 已解决的问题

1. **图片预览失效 (Base64 过大)**
   - **根因**: 原始 Base64 数据 >4MB 导致浏览器渲染性能下降。
   - **解决方案**: Canvas 压缩 (最大宽度 1200px, JPEG 质量 0.85)。
   - **效果**: 4MB+ → ~800KB，渲染速度显著提升。

2. **HEIC 格式支持**
   - **问题**: 苹果设备默认照片格式 (HEIC/HEIF) 无法在浏览器 Canvas 中预览。
   - **解决方案**:
     - 检测 HEIC 格式，跳过 Canvas 压缩。
     - 显示友好提示："预览不可用，但 AI 已成功识别"。
     - 后端 Gemini API 完全支持 HEIC 识别。
   - **测试结果**: 2.6MB HEIC 图片成功识别 6 道题目 ✅。

3. **React 控制台警告 (value prop)**
   - **问题**: `<input value={null}>` 导致警告。
   - **解决方案**: 添加默认值 `value={formData.answer || ''}`。

#### 🧪 调试工具

- 创建了 `/dashboard/practice/debug` 临时调试页面。
- 添加详细日志（前缀: `[Parser]`, `[前端]`, `[Debug]`）。
- 日志包含: 文件信息、Base64 长度、API 响应时间、错误堆栈。

#### 📋 环境配置

- **API Key**: `GEMINI_API_KEY` 已配置并验证。
- **Body Limit**: 已提升至 `10mb`。
- **模型**: `gemini-2.0-flash` with JSON mode。

---

## 4. Deliverables (交付物)
- [ ] 完整的练习中心入口 (`/practice`)。
- [ ] 可用的 PDF 上传与解析功能。
- [ ] 三种独立的刷题模式。
- [ ] 知识蜂巢与成绩预测可视化。

## 5. Definition of Done (完成标准)
- [ ] 单元测试覆盖推荐算法 (确保能选出正确的题目)。
- [ ] PDF 解析器能合理处理标准试卷格式。
- [ ] 倒计时准确，时间到自动提交。
- [ ] 所有新界面在移动端显示正常。