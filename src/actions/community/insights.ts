'use server'

import { checkAndDeductAiToken } from '@/actions/ai/tutor'
import { getCurrentUser } from '@/actions/user/auth'
import { generateAIResponse } from '@/lib/gemini'

type CommunityHintInput = {
  title: string
  content: string
  category?: string | null
  subjectName?: string | null
  tags?: string[]
}

export async function generateCommunityHint({
  title,
  content,
  category,
  subjectName,
  tags = [],
}: CommunityHintInput) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const tokenResult = await checkAndDeductAiToken()
  if (!tokenResult.success) {
    return { success: false, error: tokenResult.error || 'Insufficient AI tokens' }
  }

  const prompt = `
You are helping a student refine a community post.

Post title: ${title}
Post category: ${category || 'General'}
Subject: ${subjectName || 'Unspecified'}
Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}
Content:
${content}

Requirements:
1. Give one short actionable hint or improvement suggestion.
2. Keep it to 2 sentences max.
3. Do not repeat the post.
4. Do not answer everything fully.
5. If the post is a question, guide the student toward the next step.
6. If the post is a note or achievement, suggest one useful follow-up or refinement.
`

  try {
    const hint = await generateAIResponse(
      'You are a concise community study assistant.',
      prompt,
      'gemini-2.0-flash',
    )

    return { success: true, hint: hint.trim() }
  } catch (error) {
    console.error('Community AI Hint Error:', error)
    return {
      success: false,
      error: 'Failed to generate AI hint.',
    }
  }
}
