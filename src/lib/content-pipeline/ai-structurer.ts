import Anthropic from '@anthropic-ai/sdk'
import { AIStructuredQuestion, AIStructureResult } from './types'

export class AIStructurer {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key', // Fallback for environments without env var
    })
  }

  /**
   * 将OCR文本拆分为结构化题目
   */
  async structureQuestions(
    ocrText: string,
    context: { subjectId?: string; source?: string } = {}
  ): Promise<AIStructureResult> {
    try {
      const prompt = this.buildPrompt(ocrText, context)

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      // Handle the response content
      const contentBlock = response.content[0];
      if (contentBlock.type !== 'text') {
         throw new Error('Unexpected response format from Claude');
      }
      
      const questions = this.parseResponse(contentBlock.text)
      
      return {
        success: true,
        questions,
        processedAt: new Date(),
        tokenUsage: response.usage?.output_tokens
      }
    } catch (error: any) {
      console.error('AI Structuring failed:', error)
      return {
        success: false,
        error: error.message || 'Unknown error during AI structuring',
        processedAt: new Date()
      }
    }
  }

  private buildPrompt(ocrText: string, context: { subjectId?: string; source?: string }): string {
    return `
You are a professional educational content structurer. Your task is to convert OCR text from exam papers into structured JSON data.

**Input Text**:
${ocrText}

**Context**:
- Subject ID: ${context.subjectId || 'Unknown'}
- Source: ${context.source || 'Unknown'}

**Requirements**:
1. Identify individual questions from the text.
2. For each question, extract the following fields:
    - content: The question text (keep LaTeX formulas as $...$ or $$...$$).
    - type: One of [SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK, ESSAY, TRUE_FALSE].
    - options: Key-value map for options (e.g., {"A": "Option A text"}) if it's a choice question.
    - answer: The answer (e.g., "A", ["A", "B"], or text/number for fill-in-the-blank).
    - explanation: Any detailed explanation provided (or empty string).
    - estimatedDifficulty: An integer 1-5 (1=easiest, 5=hardest).
    - suggestedTags: A list of relevant tags (topics, concepts).
    - suggestedKnowledgePoints: A list of specific knowledge point names if identifiable.

**Output Format**:
Return ONLY a valid JSON array of objects. Do not include any conversational text outside the JSON.
Example structure:
\
[ 
  {
    "content": "Solve for x: $x^2 - 4 = 0$",
    "type": "FILL_BLANK",
    "answer": ["2", "-2"],
    "options": null,
    "explanation": "Factor as (x-2)(x+2)=0",
    "estimatedDifficulty": 2,
    "suggestedTags": ["Quadratic Equations", "Algebra"],
    "suggestedKnowledgePoints": ["Polynomial Factoring"]
  }
]
\
`
  }

  private parseResponse(text: string): AIStructuredQuestion[] {
    // Extract JSON from potential Markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text

    try {
      const parsed = JSON.parse(jsonText.trim())
      if (!Array.isArray(parsed)) {
        throw new Error('AI output is not an array')
      }
      return parsed as AIStructuredQuestion[]
    } catch (error) {
      console.error('Failed to parse AI response:', text)
      throw new Error('Failed to parse AI JSON output')
    }
  }
}
