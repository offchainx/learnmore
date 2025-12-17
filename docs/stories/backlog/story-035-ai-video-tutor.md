# Story-033: AI 错题视频生成

**状态**: Backlog ⚪
**优先级**: P0 (Phase 8核心 - 杀手级功能)
**预计工时**: 12-14小时
**前置依赖**: Story-013 (错题本)
**技术难度**: 🔴 Very High

---

## 1. 目标

针对用户错题,自动生成30秒AI讲解视频。

- [ ] AI分析错误原因
- [ ] 生成讲解脚本(自然语言)
- [ ] TTS语音合成
- [ ] 动态板书动画(数学公式推导)
- [ ] 视频合成与存储
- [ ] 支持LaTeX公式渲染

---

## 2. 技术方案

### 技术栈
- **AI分析**: Gemini API
- **TTS**: Google Cloud TTS 或 Azure TTS
- **视频合成**: Remotion (React渲染视频) 或 Canvas动画
- **公式渲染**: KaTeX
- **存储**: Supabase Storage (视频文件)

### 生成流程
```
错题数据 (question + userAnswer)
    ↓
Gemini分析错误原因 (Prompt Engineering)
    ↓
生成讲解脚本 (JSON: steps + voiceover)
    ↓
TTS生成语音 (MP3)
    ↓
Remotion渲染动画 (动态板书 + 字幕)
    ↓
合成视频 (MP4)
    ↓
上传Supabase Storage
    ↓
返回视频URL
```

### Gemini Prompt设计
```typescript
const prompt = `
题目: ${question.content}
正确答案: ${question.answer}
学生答案: ${userAnswer}

请分析:
1. 学生错在哪里(概念理解?计算失误?)
2. 生成3步讲解脚本,每步配解说词(30字内)
3. 标注需要板书的公式(LaTeX格式)

返回JSON:
{
  "errorType": "概念理解错误",
  "steps": [
    { "text": "这道题考察的是...", "formula": "ax^2 + bx + c = 0", "duration": 8 },
    { "text": "你的错误在于...", "formula": null, "duration": 10 },
    { "text": "正确做法是...", "formula": "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", "duration": 12 }
  ]
}
`;
```

### Remotion视频合成
```typescript
// src/lib/video/TutorVideo.tsx
import { Composition, AbsoluteFill, useCurrentFrame, spring } from 'remotion';
import { InlineMath } from 'react-katex';

export const TutorVideo = ({ script }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#1e293b' }}>
      {script.steps.map((step, i) => (
        <Step key={i} step={step} startFrame={i * 90} />
      ))}
    </AbsoluteFill>
  );
};

const Step = ({ step, startFrame }) => {
  const frame = useCurrentFrame();
  const progress = spring({ frame: frame - startFrame, fps: 30 });

  return (
    <div style={{ opacity: progress }}>
      <p>{step.text}</p>
      {step.formula && <InlineMath math={step.formula} />}
    </div>
  );
};
```

### Server Action
```typescript
// src/actions/generate-video.ts
'use server';

import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';

export async function generateVideoForQuestion(questionId: string) {
  // 1. 获取错题数据
  const attempt = await prisma.userAttempt.findFirst({
    where: { questionId, isCorrect: false },
    include: { question: true },
  });

  // 2. Gemini生成讲解脚本
  const script = await generateScript(attempt);

  // 3. TTS生成语音
  const audioUrl = await textToSpeech(script.steps.map(s => s.text).join(' '));

  // 4. Remotion渲染视频
  const bundled = await bundle({ entryPoint: './src/lib/video/TutorVideo.tsx' });
  const videoPath = await renderMedia({
    composition: bundled,
    inputProps: { script, audioUrl },
    codec: 'h264',
  });

  // 5. 上传到Supabase
  const { data } = await supabase.storage.from('videos').upload(`tutor-${questionId}.mp4`, videoPath);

  return data.publicUrl;
}
```

---

## 3. 性能优化

- **缓存策略**: 相同题目的视频缓存7天,避免重复生成
- **队列处理**: 使用BullMQ队列异步生成,避免阻塞用户请求
- **降级方案**: 生成失败时返回纯文字讲解

---

## 4. 验收标准

- [ ] 视频生成时间 < 30s
- [ ] 讲解准确率 > 95% (人工抽检50题)
- [ ] LaTeX公式渲染正确
- [ ] 语音清晰度 > 90分(主观评价)
- [ ] 视频播放流畅(无卡顿)

---

## 5. 成本控制

**预估成本**:
- Gemini API: $0.01/次
- TTS: $0.02/次
- Remotion渲染: $0.05/次(服务器费用)
- 存储: $0.001/MB

**总计**: ~$0.08/视频

**月度预算**: 1000用户 × 10视频/月 = $800/月

---

## 6. 交付物

- `src/actions/generate-video.ts`
- `src/lib/video/TutorVideo.tsx` (Remotion组件)
- `src/lib/ai/script-generator.ts` (脚本生成)
- `src/lib/tts/text-to-speech.ts` (TTS封装)
- `src/app/dashboard/error-book/[id]/video/page.tsx` (视频播放页)

---

**创建时间**: 2025-12-16
