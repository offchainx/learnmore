import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/auth'; // Ensure this works in API routes (it should if using auth() helper)
import prisma from '@/lib/prisma';
import { genAI, TUTOR_SYSTEM_INSTRUCTION } from '@/lib/gemini';
import { UserRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { questionId, wrongAnswer } = await req.json();

    if (!questionId) {
      return new NextResponse('Missing questionId', { status: 400 });
    }

    // 1. Transaction: Check & Deduct Token
    // We use a transaction to ensure atomicity
    let allowed = false;

    await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { aiTokenBalance: true, role: true }
      });

      if (!dbUser) throw new Error("User not found");

      if (dbUser.role === UserRole.ULTIMATE || dbUser.role === UserRole.ADMIN) {
        allowed = true;
      } else if (dbUser.aiTokenBalance > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { aiTokenBalance: { decrement: 1 } }
        });
        allowed = true;
      }
    });

    if (!allowed) {
      return new NextResponse('Insufficient AI tokens', { status: 403 });
    }

    // 2. Fetch Question Context
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        chapter: { include: { subject: true } }
      }
    });

    if (!question) {
      return new NextResponse('Question not found', { status: 404 });
    }

    // 3. Construct Prompt
    const prompt = `
Subject: ${question.chapter.subject.name}
Topic: ${question.chapter.title}
Question Difficulty: ${question.difficulty}/5

Question Content:
${question.content}

Correct Answer: ${JSON.stringify(question.answer)}
Explanation (for reference): ${question.explanation || 'None provided'}

Student's Wrong Answer: ${JSON.stringify(wrongAnswer)}

Please explain to the student why their answer might be wrong and guide them to the correct reasoning.
`;

    // 4. Call Gemini Stream
    // Using gemini-1.5-flash for speed/cost efficiency
    // @google/genai usage: client.models.generateContentStream({ model: '...', contents: ... })
    
    const result = await genAI.models.generateContentStream({
        model: "gemini-1.5-flash",
        contents: [{
            role: "user",
            parts: [{ text: TUTOR_SYSTEM_INSTRUCTION + "\n\n" + prompt }]
        }],
        // System instruction is supported differently in some versions, but appending to prompt is safe
        // Or check if config supports it.
        config: {
            temperature: 0.7,
        }
    });
    
    // Create a readable stream from the Gemini response
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result) {
                    // Check if text is a function or property. SDKs vary.
                    // Error suggested it's a getter.
                    let text: string | undefined;
                    // @ts-ignore
                    if (typeof chunk.text === 'function') {
                        // @ts-ignore
                        text = chunk.text();
                    } else {
                        // @ts-ignore
                        text = chunk.text;
                    }
                    
                    if (text) {
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                controller.close();
            } catch (e) {
                controller.error(e);
            }
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        }
    });

  } catch (error) {
    console.error('AI Tutor Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
