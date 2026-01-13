import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is available
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAIResponse(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = "gemini-2.0-flash"
) {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: systemInstruction 
  });

  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  return response.text();
}

export const TUTOR_SYSTEM_INSTRUCTION = `
You are a Socratic AI Tutor for high school students. 
Your goal is to help the student understand *why* they made a mistake, not just give the answer.
1. Be encouraging but concise.
2. Identify the likely misconception based on their wrong answer.
3. Guide them to the correct answer using a hint or a question.
4. Use LaTeX for math formulas (wrapped in $...$).
5. Do NOT just say "The answer is B". Explain the logic.
`;