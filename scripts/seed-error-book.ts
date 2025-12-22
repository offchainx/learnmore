import prisma from '../src/lib/prisma'

/**
 * Seed script to populate ErrorBook with sample data
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
    console.warn(`Seeding error book for user: ${user.email} (${user.id})`)
    for (const q of questions) {
      await prisma.errorBook.upsert({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId: q.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          questionId: q.id,
          masteryLevel: 0
        }
      })
    }
    console.warn(`Added ${questions.length} questions to error book for ${user.email}.`)
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
