import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIStructurer } from '../ai-structurer'

// Mock the Anthropic SDK
const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class {
      messages = {
        create: mockCreate
      }
    }
  }
})

describe('AIStructurer', () => {
  let structurer: AIStructurer

  beforeEach(() => {
    vi.clearAllMocks()
    structurer = new AIStructurer()
  })

  it('should successfully structure questions from text', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: `
\
  {
    "content": "Test Question",
    "type": "SINGLE_CHOICE",
    "answer": "A",
    "estimatedDifficulty": 3
  }
]
\
          `
        }
      ],
      usage: { output_tokens: 100 }
    }

    mockCreate.mockResolvedValue(mockResponse as any)

    const result = await structurer.structureQuestions('Raw OCR Text')

    expect(result.success).toBe(true)
    expect(result.questions).toHaveLength(1)
    expect(result.questions![0].content).toBe('Test Question')
    expect(result.tokenUsage).toBe(100)
  })

  it('should handle API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'))

    const result = await structurer.structureQuestions('Raw OCR Text')

    expect(result.success).toBe(false)
    expect(result.error).toContain('API Error')
  })

  it('should handle JSON parsing errors', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: 'Invalid JSON here'
        }
      ]
    }

    mockCreate.mockResolvedValue(mockResponse as any)

    const result = await structurer.structureQuestions('Raw OCR Text')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to parse AI JSON output')
  })
})
