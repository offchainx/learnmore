
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProblemHint(equation: string, question: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a helpful math tutor. Give a short, subtle hint for this problem: "${question} ${equation}". 
      Requirements:
      1. One or two sentences max.
      2. Don't give the answer.
      3. Point towards the core mathematical principle (e.g., factoring, quadratic formula, or common factors).`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return "Consider identifying your a, b, and c coefficients for the quadratic formula.";
  }
}

export async function explainSolution(equation: string, selectedOption: string, isCorrect: boolean) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `The student is solving the equation: ${equation}. 
      They selected the option: "${selectedOption}".
      The result was: ${isCorrect ? 'CORRECT' : 'INCORRECT'}.
      
      Provide a concise step-by-step explanation of how to solve this specific equation. 
      If they were incorrect, gently explain the common pitfall (like sign errors).
      If they were correct, reinforce the concept. 
      Keep it under 150 words.`,
      config: {
        temperature: 0.4,
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "Check your discriminant (b² - 4ac) to see if you made a calculation error.";
  }
}
