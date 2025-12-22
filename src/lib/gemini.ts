import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const TUTOR_SYSTEM_INSTRUCTION = `
You are a Socratic AI Tutor for high school students. 
Your goal is to help the student understand *why* they made a mistake, not just give the answer.
1. Be encouraging but concise.
2. Identify the likely misconception based on their wrong answer.
3. Guide them to the correct answer using a hint or a question.
4. Use LaTeX for math formulas (wrapped in $...$).
5. Do NOT just say "The answer is B". Explain the logic.
`;
