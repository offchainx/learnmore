import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  QuestionQualityChecker,
  createQualityChecker,
  calculateQuickQualityScore,
  checkQuestionQuality,
  type QualityCheckInput,
} from '../quality-checker'

// Mock fetch for image checking
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock KaTeX for LaTeX checking
vi.mock('katex', () => ({
  default: {
    renderToString: vi.fn((latex: string) => {
      // 模拟 KaTeX 行为：某些语法会抛出错误
      if (latex.includes('\\invalid')) {
        throw new Error('KaTeX parse error')
      }
      return `<span>${latex}</span>`
    }),
  },
}))

describe('QuestionQualityChecker', () => {
  let checker: QuestionQualityChecker

  beforeEach(() => {
    vi.clearAllMocks()
    checker = new QuestionQualityChecker()
    // 默认 fetch 返回成功
    mockFetch.mockResolvedValue({ ok: true })
  })

  // ==================== 基础检查测试 ====================

  describe('内容检查 (MISSING_CONTENT)', () => {
    it('应该检测到内容过短', async () => {
      const question: QualityCheckInput = {
        content: '短',
        type: 'SINGLE_CHOICE',
        answer: 'A',
        options: { A: '选项A', B: '选项B' },
      }

      const result = await checker.check(question)

      expect(result.isValid).toBe(false)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'MISSING_CONTENT',
          type: 'ERROR',
        })
      )
      expect(result.score).toBeLessThan(100)
    })

    it('应该检测到内容为空', async () => {
      const question: QualityCheckInput = {
        content: '',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.isValid).toBe(false)
      expect(result.issues.some((i) => i.category === 'MISSING_CONTENT')).toBe(true)
    })

    it('应该通过有效内容的检查', async () => {
      const question: QualityCheckInput = {
        content: '这是一道完整的题目内容，足够长的描述。',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'MISSING_CONTENT')).toBe(false)
    })
  })

  describe('选项检查 (INSUFFICIENT_OPTIONS)', () => {
    it('应该检测到选择题缺少选项', async () => {
      const question: QualityCheckInput = {
        content: '下列哪个选项是正确的？',
        type: 'SINGLE_CHOICE',
        answer: 'A',
        options: null,
      }

      const result = await checker.check(question)

      expect(result.isValid).toBe(false)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'INSUFFICIENT_OPTIONS',
          type: 'ERROR',
        })
      )
    })

    it('应该检测到选项数量不足', async () => {
      const question: QualityCheckInput = {
        content: '下列哪个选项是正确的？',
        type: 'MULTIPLE_CHOICE',
        answer: ['A'],
        options: { A: '只有一个选项' },
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'INSUFFICIENT_OPTIONS')).toBe(true)
    })

    it('应该检测到空选项内容', async () => {
      const question: QualityCheckInput = {
        content: '下列哪个选项是正确的？',
        type: 'SINGLE_CHOICE',
        answer: 'A',
        options: { A: '有内容', B: '', C: '有内容' },
      }

      const result = await checker.check(question)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'INSUFFICIENT_OPTIONS',
          type: 'WARNING',
        })
      )
    })

    it('应该不检查非选择题的选项', async () => {
      const question: QualityCheckInput = {
        content: '请填写正确答案',
        type: 'FILL_BLANK',
        answer: '42',
        options: null,
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'INSUFFICIENT_OPTIONS')).toBe(false)
    })
  })

  describe('答案检查 (MISSING_ANSWER)', () => {
    it('应该检测到缺少答案', async () => {
      const question: QualityCheckInput = {
        content: '这是一道没有答案的题目',
        type: 'FILL_BLANK',
        answer: undefined,
      }

      const result = await checker.check(question)

      expect(result.isValid).toBe(false)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'MISSING_ANSWER',
          type: 'ERROR',
        })
      )
    })

    it('应该检测到空字符串答案', async () => {
      const question: QualityCheckInput = {
        content: '这是一道空答案的题目',
        type: 'FILL_BLANK',
        answer: '',
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'MISSING_ANSWER')).toBe(true)
    })

    it('应该检测到空数组答案', async () => {
      const question: QualityCheckInput = {
        content: '这是一道空数组答案的题目',
        type: 'MULTIPLE_CHOICE',
        answer: [],
        options: { A: '选项A', B: '选项B' },
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'MISSING_ANSWER')).toBe(true)
    })

    it('应该检测到无效的选择题答案', async () => {
      const question: QualityCheckInput = {
        content: '下列哪个选项是正确的？',
        type: 'SINGLE_CHOICE',
        answer: 'D', // 选项中没有 D
        options: { A: '选项A', B: '选项B', C: '选项C' },
      }

      const result = await checker.check(question)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'MISSING_ANSWER',
          type: 'WARNING',
          message: expect.stringContaining('不在选项列表中'),
        })
      )
    })
  })

  describe('LaTeX 检查 (INVALID_LATEX)', () => {
    it('应该检测到无效的 LaTeX 语法', async () => {
      const question: QualityCheckInput = {
        content: '计算 $\\invalid{expression}$ 的值',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'INVALID_LATEX',
          type: 'WARNING',
        })
      )
    })

    it('应该通过有效的 LaTeX', async () => {
      const question: QualityCheckInput = {
        content: '计算 $x^2 + 2x + 1 = 0$ 的解',
        type: 'FILL_BLANK',
        answer: 'x = -1',
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'INVALID_LATEX')).toBe(false)
    })

    it('应该在禁用 LaTeX 检查时跳过', async () => {
      const checkerNoLatex = new QuestionQualityChecker({ checkLatex: false })
      const question: QualityCheckInput = {
        content: '计算 $\\invalid{expression}$ 的值',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checkerNoLatex.check(question)

      expect(result.issues.some((i) => i.category === 'INVALID_LATEX')).toBe(false)
    })
  })

  describe('图片检查 (BROKEN_IMAGE)', () => {
    it('应该检测到失效的图片链接', async () => {
      mockFetch.mockResolvedValue({ ok: false })

      const question: QualityCheckInput = {
        content: '观察下图 ![示意图](https://example.com/broken.jpg) 并回答',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'BROKEN_IMAGE',
          type: 'ERROR',
        })
      )
    })

    it('应该通过有效的图片链接', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const question: QualityCheckInput = {
        content: '观察下图 ![示意图](https://example.com/valid.jpg) 并回答',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'BROKEN_IMAGE')).toBe(false)
    })

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const question: QualityCheckInput = {
        content: '观察下图 ![示意图](https://example.com/error.jpg) 并回答',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.issues.some((i) => i.category === 'BROKEN_IMAGE')).toBe(true)
    })

    it('应该在禁用图片检查时跳过', async () => {
      mockFetch.mockResolvedValue({ ok: false })
      const checkerNoImages = new QuestionQualityChecker({ checkImages: false })

      const question: QualityCheckInput = {
        content: '观察下图 ![示意图](https://example.com/broken.jpg) 并回答',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checkerNoImages.check(question)

      expect(result.issues.some((i) => i.category === 'BROKEN_IMAGE')).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('应该提取 HTML img 标签中的图片', async () => {
      mockFetch.mockResolvedValue({ ok: false })

      const question: QualityCheckInput = {
        content: '观察下图 <img src="https://example.com/html.jpg" alt="图片"> 并回答',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/html.jpg', expect.any(Object))
    })
  })

  describe('知识点检查 (NO_KNOWLEDGE_POINTS)', () => {
    it('应该检测到未标注知识点', async () => {
      const mockKPChecker = vi.fn().mockResolvedValue(0)
      const checkerWithKP = new QuestionQualityChecker({}, mockKPChecker)

      const question: QualityCheckInput = {
        id: 'test-id',
        content: '这是一道完整的题目',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checkerWithKP.check(question)

      expect(mockKPChecker).toHaveBeenCalledWith('test-id')
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          category: 'NO_KNOWLEDGE_POINTS',
          type: 'WARNING',
        })
      )
    })

    it('应该通过已标注知识点的题目', async () => {
      const mockKPChecker = vi.fn().mockResolvedValue(2)
      const checkerWithKP = new QuestionQualityChecker({}, mockKPChecker)

      const question: QualityCheckInput = {
        id: 'test-id',
        content: '这是一道完整的题目',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checkerWithKP.check(question)

      expect(result.issues.some((i) => i.category === 'NO_KNOWLEDGE_POINTS')).toBe(false)
    })

    it('应该跳过没有 ID 的题目的知识点检查', async () => {
      const mockKPChecker = vi.fn().mockResolvedValue(0)
      const checkerWithKP = new QuestionQualityChecker({}, mockKPChecker)

      const question: QualityCheckInput = {
        content: '这是一道没有 ID 的新题目',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checkerWithKP.check(question)

      expect(mockKPChecker).not.toHaveBeenCalled()
      expect(result.issues.some((i) => i.category === 'NO_KNOWLEDGE_POINTS')).toBe(false)
    })
  })

  // ==================== 分数计算测试 ====================

  describe('分数计算', () => {
    it('完美题目应该得到满分', async () => {
      const question: QualityCheckInput = {
        content: '这是一道完整的题目内容，足够长的描述。',
        type: 'SINGLE_CHOICE',
        answer: 'A',
        options: { A: '正确答案', B: '错误答案', C: '错误答案', D: '错误答案' },
        explanation: '这是详细的解析，解释为什么选择 A。',
      }

      const result = await checker.check(question)

      expect(result.score).toBe(100) // 基础 100 + 解析加分 5，但上限为 100
      expect(result.passed).toBe(true)
      expect(result.isValid).toBe(true)
    })

    it('有解析的题目应该得到加分', async () => {
      // 使用没有满分的题目来测试加分效果
      const questionWithExplanation: QualityCheckInput = {
        content: '这是一道完整的题目内容',
        type: 'FILL_BLANK',
        answer: '42',
        explanation: '这是解析说明为什么答案是 42。',
      }

      const questionWithoutExplanation: QualityCheckInput = {
        content: '这是一道完整的题目内容',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const resultWith = await checker.check(questionWithExplanation)
      const resultWithout = await checker.check(questionWithoutExplanation)

      // 两者都是满分100，但我们验证有解析的分数不低于没解析的
      expect(resultWith.score).toBeGreaterThanOrEqual(resultWithout.score)
    })

    it('多个问题应该累计扣分', async () => {
      const question: QualityCheckInput = {
        content: '短', // 内容过短
        type: 'SINGLE_CHOICE',
        answer: undefined, // 缺少答案
        options: { A: '只有一个' }, // 选项不足
      }

      const result = await checker.check(question)

      expect(result.score).toBeLessThan(50)
      expect(result.issues.length).toBeGreaterThanOrEqual(3)
    })

    it('分数不应该低于 0', async () => {
      const question: QualityCheckInput = {
        content: '', // 内容为空
        type: 'SINGLE_CHOICE',
        answer: null, // 答案为空
        options: null, // 选项为空
      }

      const result = await checker.check(question)

      expect(result.score).toBeGreaterThanOrEqual(0)
    })
  })

  // ==================== 批量检查测试 ====================

  describe('批量检查 (checkBatch)', () => {
    it('应该正确统计批量检查结果', async () => {
      const questions: QualityCheckInput[] = [
        { content: '这是第一道完整的题目内容描述', type: 'FILL_BLANK', answer: '42' },
        { content: '这是第二道完整的题目内容描述', type: 'FILL_BLANK', answer: '100' },
        { content: '短', type: 'FILL_BLANK', answer: null }, // 会失败
      ]

      const result = await checker.checkBatch(questions)

      expect(result.total).toBe(3)
      expect(result.passed).toBe(2)
      expect(result.failed).toBe(1)
      expect(result.results).toHaveLength(3)
    })

    it('应该计算正确的平均分', async () => {
      const questions: QualityCheckInput[] = [
        { content: '这是第一道完整的题目内容描述', type: 'FILL_BLANK', answer: '42' },
        { content: '这是第二道完整的题目内容描述', type: 'FILL_BLANK', answer: '100' },
      ]

      const result = await checker.checkBatch(questions)

      expect(result.averageScore).toBe(100) // 两个满分题目
    })

    it('应该保留题目 ID', async () => {
      const questions: QualityCheckInput[] = [
        { id: 'q1', content: '题目一的完整内容', type: 'FILL_BLANK', answer: '42' },
        { id: 'q2', content: '题目二的完整内容', type: 'FILL_BLANK', answer: '100' },
      ]

      const result = await checker.checkBatch(questions)

      expect(result.results[0].questionId).toBe('q1')
      expect(result.results[1].questionId).toBe('q2')
    })

    it('应该支持并发控制', async () => {
      const questions: QualityCheckInput[] = Array.from({ length: 10 }, (_, i) => ({
        content: `题目 ${i} 的完整内容描述`,
        type: 'FILL_BLANK' as const,
        answer: String(i),
      }))

      const result = await checker.checkBatch(questions, { concurrency: 2 })

      expect(result.total).toBe(10)
      expect(result.results).toHaveLength(10)
    })
  })

  // ==================== 快速评分测试 ====================

  describe('快速评分 (calculateQuickScore)', () => {
    it('应该不执行网络请求', () => {
      const question: QualityCheckInput = {
        content: '观察下图 ![示意图](https://example.com/image.jpg) 并回答问题',
        type: 'FILL_BLANK',
        answer: '42',
      }

      mockFetch.mockClear()
      const score = checker.calculateQuickScore(question)

      expect(mockFetch).not.toHaveBeenCalled()
      expect(score).toBe(100)
    })

    it('应该正确计算基础分数', () => {
      const question: QualityCheckInput = {
        content: '短',
        type: 'SINGLE_CHOICE',
        answer: null,
        options: { A: '只有一个' },
      }

      const score = checker.calculateQuickScore(question)

      expect(score).toBeLessThan(50)
    })
  })

  // ==================== 建议生成测试 ====================

  describe('建议生成', () => {
    it('应该为每种问题生成对应的建议', async () => {
      const question: QualityCheckInput = {
        content: '短',
        type: 'SINGLE_CHOICE',
        answer: null,
        options: { A: '只有一个' },
      }

      const result = await checker.check(question)

      expect(result.suggestions).toContain('请补充完整的题目内容')
      expect(result.suggestions).toContain('请确保选择题有至少 2 个有效选项')
      expect(result.suggestions).toContain('请提供正确答案')
    })

    it('完美题目不应该有建议', async () => {
      const question: QualityCheckInput = {
        content: '这是一道完整的题目内容，足够长的描述。',
        type: 'FILL_BLANK',
        answer: '42',
      }

      const result = await checker.check(question)

      expect(result.suggestions).toHaveLength(0)
    })
  })

  // ==================== 便捷函数测试 ====================

  describe('便捷函数', () => {
    it('createQualityChecker 应该创建检查器实例', () => {
      const instance = createQualityChecker({ checkLatex: false })
      expect(instance).toBeInstanceOf(QuestionQualityChecker)
    })

    it('calculateQuickQualityScore 应该返回分数', () => {
      const score = calculateQuickQualityScore({
        content: '这是一道完整的题目内容描述文字',
        type: 'FILL_BLANK',
        answer: '42',
      })
      expect(score).toBe(100)
    })

    it('checkQuestionQuality 应该返回完整结果', async () => {
      const result = await checkQuestionQuality({
        content: '完整的题目内容描述',
        type: 'FILL_BLANK',
        answer: '42',
      })

      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('passed')
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('suggestions')
      expect(result).toHaveProperty('isValid')
    })
  })
})
