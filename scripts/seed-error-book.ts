import prisma from '../src/lib/prisma'

/**
 * Seed script to populate weak-attempt samples (replacing ErrorBook)
 * Run with: tsx scripts/seed-error-book.ts
 */
async function main() {
  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.warn('No users found. Please seed users first.')
    return
  }

  // Get some questions
  const questions = await prisma.question.findMany({ take: 3 })

  if (questions.length === 0) {
    console.warn('No questions found in DB. Please seed questions first.')
    return
  }

  for (const user of users) {
    console.warn(`Seeding weak-attempt samples for user: ${user.email} (${user.id})`)
    for (const q of questions) {
      await prisma.userAttempt.create({
        data: {
          userId: user.id,
          questionId: q.id,
          userAnswer: 'B',
          isCorrect: false,
          duration: 30,
        },
      })
    }
    console.warn(`Added ${questions.length} weak attempts for ${user.email}.`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
