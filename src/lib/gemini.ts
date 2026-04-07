import { GoogleGenerativeAI } from '@google/generative-ai'

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || null
}

export function getGeminiClient() {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return null
  }

  return new GoogleGenerativeAI(apiKey)
}

function createMissingKeyError() {
  return new Error('GEMINI_API_KEY is not set in environment variables.')
}

export async function generateAIResponse(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = 'gemini-2.0-flash'
) {
  const genAI = getGeminiClient()
  if (!genAI) {
    throw createMissingKeyError()
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction,
  })

  const result = await model.generateContent(userPrompt)
  const response = await result.response
  return response.text()
}

export const TUTOR_SYSTEM_INSTRUCTION = `
You are a Socratic AI Tutor for high school students. 
Your goal is to help the student understand *why* they made a mistake, not just give the answer.
1. Be encouraging but concise.
2. Identify the likely misconception based on their wrong answer.
3. Guide them to the correct answer using a hint or a question.
4. Use LaTeX for math formulas (wrapped in $...$).
5. Do NOT just say "The answer is B". Explain the logic.
`
