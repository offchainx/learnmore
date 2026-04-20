import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockPrisma,
} = vi.hoisted(() => ({
  mockPrisma: {
    chapter: {
      findMany: vi.fn(),
    },
    sourceFile: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

import { suggestQuestionChapters } from '@/lib/content-pipeline/chapter-tagging'

const SUBJECT_ID = '72844ae3-6f0d-4cfd-8add-70de535aa316'
const ENGLISH_SUBJECT_ID = 'ba8abbcc-05db-4fd9-969f-04d74462df6d'

const CHAPTERS = [
  {
    id: 'chapter-order',
    title: '2.2.1 中国古代史 - 中国各朝代的顺序',
    parentId: null,
  },
  {
    id: 'chapter-zhou',
    title: '2.2.2 中国古代史 - 周朝的封建制度和宗法制度',
    parentId: null,
  },
  {
    id: 'chapter-qin',
    title: '2.2.3 中国古代史 - 秦始皇的功绩',
    parentId: null,
  },
  {
    id: 'chapter-han',
    title: '2.2.4 中国古代史 - 汉武帝的政绩与丝绸之路',
    parentId: null,
  },
  {
    id: 'chapter-culture',
    title: '2.2.12 中国古代史 - 中国文化之代表及特色',
    parentId: null,
  },
]

const ENGLISH_CHAPTERS = [
  {
    id: 'chapter-transport',
    title: '1.15 Context - Transport',
    parentId: null,
  },
  {
    id: 'chapter-natural-world',
    title: '1.14 Context - The Natural World',
    parentId: null,
  },
  {
    id: 'chapter-dialogue',
    title: '2.2 Text Types - Conversations, Dialogues and Interviews',
    parentId: null,
  },
  {
    id: 'chapter-greetings',
    title: '3.12 Forms and Functions - Conveying Greetings',
    parentId: null,
  },
  {
    id: 'chapter-introductions',
    title: '3.14 Forms and Functions - Making Introductions',
    parentId: null,
  },
  {
    id: 'chapter-verbs',
    title: '5.8 Grammar - Verbs',
    parentId: null,
  },
  {
    id: 'chapter-infinitives',
    title: '5.9 Grammar - Infinitives and Gerunds',
    parentId: null,
  },
  {
    id: 'chapter-prepositions',
    title: '5.6 Grammar - Prepositions',
    parentId: null,
  },
]

describe('chapter-tagging 联合打标', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockPrisma.chapter.findMany.mockResolvedValue(CHAPTERS)
    mockPrisma.sourceFile.findMany.mockResolvedValue([
      {
        id: 'source-1',
        filename: '七年级历史上期中试题',
        sourceNote: '第一单元总评',
        fileUrl: 'https://example.com/source-1',
      },
      {
        id: 'source-2',
        filename: '七年级历史上册汉武帝专题练习',
        sourceNote: '复习卷',
        fileUrl: 'https://example.com/source-2',
      },
    ])
  })

  it('会结合答案字段补出章节', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'q-1',
        content: '材料二与哪一历史事件有关？这件事产生了什么重大影响？',
        answer: '商鞅变法',
        subjectId: SUBJECT_ID,
        sourceFileId: 'source-1',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-qin')
    expect(suggestion.strategy).toBe('rule')
    expect(suggestion.confidence).toBeGreaterThan(0.5)
  })

  it('会结合选项字段识别人物与事件题', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'q-2',
        content: '下列人物与事件没有直接联系的是',
        options: {
          A: '晋文公——城濮之战',
          B: '墨子——百家争鸣',
          C: '秦孝公——商鞅变法',
          D: '孟子——《道德经》',
        },
        answer: 'D',
        subjectId: SUBJECT_ID,
        sourceFileId: 'source-1',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-culture')
    expect(suggestion.strategy).toBe('rule')
  })

  it('会把来源信息作为辅助信号，但不会单独乱判', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'q-3',
        content: '请判断下列说法是否正确',
        subjectId: SUBJECT_ID,
        sourceFileId: 'source-2',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-han')
    expect(suggestion.reason).toContain('来源')
  })
})

describe('chapter-tagging 英文规则', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockPrisma.chapter.findMany.mockResolvedValue(ENGLISH_CHAPTERS)
    mockPrisma.sourceFile.findMany.mockResolvedValue([
      {
        id: 'english-source-1',
        filename: 'Unit 3 How do you get to school?单元检测试题',
        sourceNote: 'Unit 3 How do you get to school?单元检测试题',
        fileUrl: 'https://example.com/english-source-1',
      },
      {
        id: 'english-source-2',
        filename: '七年级英语下学期综合测评二',
        sourceNote: '七年级英语下学期综合测评二',
        fileUrl: 'https://example.com/english-source-2',
      },
      {
        id: 'english-source-3',
        filename: '专题 Unit 7 It\'s raining',
        sourceNote: '专题 Unit 7 It\'s raining',
        fileUrl: 'https://example.com/english-source-3',
      },
    ])
  })

  it('会结合内容和来源识别交通场景', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'en-1',
        content: 'It is difficult for the boy to school. He often takes the bus.',
        source: 'Unit 3 How do you get to school?单元检测试题',
        subjectId: ENGLISH_SUBJECT_ID,
        sourceFileId: 'english-source-1',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-transport')
    expect(suggestion.strategy).toBe('rule')
    expect(suggestion.reason).toContain('来源')
  })

  it('会结合括号动词和答案识别语法动词', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'en-2',
        content: 'My sister seldom ____ (play) volleyball now.',
        answer: ['plays'],
        source: '牛津英语七A Unit 4单元测试卷',
        subjectId: ENGLISH_SUBJECT_ID,
        sourceFileId: 'english-source-2',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-verbs')
    expect(suggestion.strategy).toBe('rule')
  })

  it('会识别问候与介绍类对话', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'en-3',
        content: '— Nice to meet you, Eric! — ________.',
        source: '七年级英语下学期综合测评二',
        subjectId: ENGLISH_SUBJECT_ID,
        sourceFileId: 'english-source-2',
      },
    ])

    expect(['chapter-greetings', 'chapter-introductions']).toContain(suggestion.chapterId)
    expect(suggestion.strategy).toBe('rule')
  })

  it('会结合不定式提示识别动词不定式与动名词', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'en-4',
        content: 'He held a party without ____ (invite) us.',
        answer: ['inviting'],
        source: '专题 Unit 7 It\'s raining',
        subjectId: ENGLISH_SUBJECT_ID,
        sourceFileId: 'english-source-3',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-infinitives')
    expect(suggestion.strategy).toBe('rule')
  })

  it('会识别天气相关内容', async () => {
    const [suggestion] = await suggestQuestionChapters([
      {
        id: 'en-5',
        content: 'How’s the weather in Tianjin?',
        answer: 'What’s the weather like in Tianjin?',
        source: '专题 Unit 7 It\'s raining',
        subjectId: ENGLISH_SUBJECT_ID,
        sourceFileId: 'english-source-3',
      },
    ])

    expect(suggestion.chapterId).toBe('chapter-natural-world')
    expect(suggestion.strategy).toBe('rule')
  })
})
