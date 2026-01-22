'use server'

import { genAI } from '@/lib/gemini'
import { getCurrentUser } from '@/actions/auth'

export interface ParsedQuestion {
  content: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY'
  options?: Record<string, string>
  answer: string | string[]
  explanation: string
  difficulty?: number
}

interface ParseResult {
  success: boolean
  data?: ParsedQuestion[]
  error?: string
  rawResponse?: string // 新增：用于调试
}

const PARSER_SYSTEM_PROMPT = `
You are an expert educational assistant. Your task is to analyze an image (e.g., from an exam paper or exercise book) and extract ALL distinct questions visible.

**Output Rules:**
1. Return a JSON ARRAY of objects (even if only one question).
2. For "content", use Markdown and LaTeX ($...$) for math formulas.
3. "type" MUST be one of: "SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_BLANK", "ESSAY".
4. "options" is a key-value object where:
   - Key = option label (A, B, C, D, etc.)
   - Value = FULL option text/description (not just the label)
   - Example: {"A": "平行四边形", "B": "正方形", "C": "圆形", "D": "三角形"}
5. "answer":
   - For SINGLE_CHOICE: string (e.g., "B")
   - For MULTIPLE_CHOICE: array (e.g., ["A", "C"])
   - If answer is NOT visible in image, set to null
6. "explanation":
   - Detailed step-by-step solution explaining WHY the answer is correct
   - If no explanation visible, provide a brief educational hint
   - If no information available, set to null
7. "difficulty": integer 1-5 (1=easy, 5=hard). Estimate based on question complexity.

**Important:**
- Extract COMPLETE option text, not just labels
- If an option contains a formula or diagram description, include it
- If the image shows both questions and answers, extract both
- If only questions are visible (no answers), set answer/explanation to null

Extract ALL distinct questions found in the image.
`

export async function parseQuestionImage(formData: FormData): Promise<ParseResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    console.log('📤 [Parser] 接收到文件:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    })

    // Convert File to Base64 for Gemini
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    console.log('🔄 [Parser] Base64 转换完成:', {
      base64Length: base64Data.length,
      estimatedSize: `${(base64Data.length / 1024 / 1024).toFixed(2)}MB`
    })

    // 使用 2.0 Flash 强制 JSON 输出模式
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    })

    console.log('🤖 [Parser] 调用 Gemini API...')
    const startTime = Date.now()

    const result = await model.generateContent([
      PARSER_SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ])

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [Parser] Gemini 响应成功 (耗时: ${elapsedTime}ms)`)

    const responseText = result.response.text()
    console.log('📥 [Parser] 原始响应 (前200字符):', responseText.substring(0, 200))
    
    try {
      const json = JSON.parse(responseText)
      const parsedData = Array.isArray(json) ? json : [json]
      return { success: true, data: parsedData }
    } catch {
      console.error('JSON Parse Error:', responseText)
      return { 
        success: false, 
        error: 'AI response was not valid JSON',
        rawResponse: responseText.substring(0, 500) // 返回前500个字符用于调试
      }
    }

  } catch (error) {
    console.error('❌ [Parser] 解析失败:', error)

    // 提供更详细的错误信息
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('错误堆栈:', error.stack)
    }

    return {
      success: false,
      error: `解析失败: ${errorMessage}`
    }
  }
}
