# Story-031: AI 学习诊断报告

**状态**: Backlog ⚪
**优先级**: P0 (Phase 8核心 - AI差异化功能)
**预计工时**: 10-12小时
**前置依赖**: Story-012 (判卷系统), Story-013 (错题本)
**阻塞Story**: None
**技术难度**: 🔴 High

---

## 1. 目标

利用Gemini API分析用户答题数据,生成自然语言周报。

- [ ] 接入Gemini API分析答题记录
- [ ] 生成知识点热力图
- [ ] 薄弱点分析与建议
- [ ] 同年级对比分析
- [ ] PDF周报生成
- [ ] 支持微信/邮件推送

---

## 2. 技术方案

### 技术栈
- **AI分析**: Gemini API (Google AI Studio)
- **图表生成**: Recharts + canvas-to-blob
- **PDF生成**: jsPDF + html2canvas
- **消息推送**: 微信服务号 Template Message

### 数据流程
```
用户答题数据 (Prisma)
    ↓
Gemini API分析 (Prompt Engineering)
    ↓
生成诊断报告 (JSON)
    ↓
前端渲染 (Recharts热力图 + 文字报告)
    ↓
导出PDF (jsPDF)
    ↓
推送到微信/邮箱
```

### Gemini Prompt设计
```typescript
const prompt = `
你是一位资深中学数学教师。请分析以下学生的答题记录:

答题数据:
${JSON.stringify(userAttempts)}

请从以下维度分析:
1. 知识点掌握情况(分数0-100)
2. 薄弱点Top 3
3. 学习建议(3条,具体可操作)
4. 与年级平均水平对比

返回JSON格式:
{
  "knowledgeMap": [{"topic": "一次函数", "score": 85}, ...],
  "weakPoints": ["二次函数应用题", "几何证明", "..."],
  "suggestions": ["建议加强...", "可以尝试...", "..."],
  "gradeComparison": { "userScore": 78, "avgScore": 72 }
}
`;
```

### Server Action实现
```typescript
// src/actions/ai-diagnostics.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

export async function generateWeeklyReport(userId: string) {
  // 1. 获取最近7天答题记录
  const attempts = await prisma.userAttempt.findMany({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: { question: true },
  });

  // 2. 调用Gemini API分析
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const result = await model.generateContent(prompt);
  const report = JSON.parse(result.response.text());

  // 3. 保存报告到数据库
  await prisma.diagnosticReport.create({
    data: { userId, report, createdAt: new Date() },
  });

  return report;
}
```

### PDF生成
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(reportId: string) {
  const element = document.getElementById('report-container');
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
  pdf.save(`weekly-report-${reportId}.pdf`);
}
```

---

## 3. 数据库Schema扩展

```prisma
model DiagnosticReport {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  report    Json     // 存储Gemini生成的JSON报告
  createdAt DateTime @default(now())
}
```

---

## 4. 验收标准

- [ ] Gemini API调用成功率 > 95%
- [ ] 报告生成时间 < 10s
- [ ] 知识点准确率 > 90% (人工抽检)
- [ ] PDF导出功能正常
- [ ] 微信推送成功率 > 98%
- [ ] 支持历史报告查看

---

## 5. 风险控制

**风险1**: Gemini API调用失败
**解决方案**: 实现重试机制(最多3次),失败后降级为规则引擎生成报告

**风险2**: API费用超支
**解决方案**: 
- 设置月度配额上限
- 缓存相似报告(7天内不重复生成)
- 免费用户限制生成次数(1次/周)

---

## 6. 交付物

- `src/actions/ai-diagnostics.ts` - Server Action
- `src/app/dashboard/reports/page.tsx` - 报告页面
- `src/components/reports/KnowledgeHeatmap.tsx` - 热力图组件
- `src/components/reports/WeaknessAnalysis.tsx` - 薄弱点分析
- `src/lib/ai/gemini-client.ts` - Gemini客户端封装
- Prisma Migration文件

---

**创建时间**: 2025-12-16
