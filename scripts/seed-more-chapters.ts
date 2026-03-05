
import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding more chapters for Mathematics...')

  // 1. Find Mathematics subject
  const mathSubject = await prisma.subject.findFirst({
    where: {
      name: {
        contains: 'Math',
        mode: 'insensitive'
      }
    }
  })

  if (!mathSubject) {
    console.error('❌ Mathematics subject not found!')
    return
  }

  console.log(`✅ Found subject: ${mathSubject.name} (${mathSubject.id})`)

  // 2. Get a valid user to assign attempts to
  const user = await prisma.user.findFirst()
  if (!user) {
    console.error('❌ No user found to assign attempts!')
    return
  }
  console.log(`👤 Assigning attempts to user: ${user.email} (${user.id})`)

  // 3. Create 12 more chapters
  const extraChapters = [
    "Algebraic Expansion & Factorisation",
    "Quadratic Equations & Graphs",
    "Simultaneous Equations",
    "Indices & Surds",
    "Coordinate Geometry",
    "Trigonometry: Sine & Cosine Rules",
    "Circular Measure (Radians)",
    "Differentiation: Basics",
    "Applications of Differentiation",
    "Integration: Area under Curve",
    "Kinematics: Displacement & Velocity",
    "Vectors in Two Dimensions"
  ]

  // Get current max order
  const lastChapter = await prisma.chapter.findFirst({
    where: { subjectId: mathSubject.id },
    orderBy: { order: 'desc' }
  })
  let startOrder = (lastChapter?.order || 0) + 1

  for (const title of extraChapters) {
    // Create Chapter
    const chapter = await prisma.chapter.create({
      data: {
        title,
        subjectId: mathSubject.id,
        order: startOrder++,
      }
    })

    console.log(`   - Created chapter: ${chapter.title}`)

    // Create a dummy question for this chapter (so we can link attempts)
    const question = await prisma.question.create({
      data: {
        content: `Sample question for ${title}`,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: 3,
        chapterId: chapter.id,
        options: { a: "Option A", b: "Option B", c: "Option C", d: "Option D" },
        answer: "a",
        explanation: "This is a generated question."
      }
    })

    // Randomly assign mastery (UserAttempt)
    // 30% Green (Strong), 30% Yellow (Fair), 20% Red (Weak), 20% Gray (Locked)
    const rand = Math.random()
    let attemptsCount = 0
    let correctCount = 0

    if (rand > 0.2) { // 80% chance to have attempts
      if (rand > 0.7) {
        // Strong (>80%)
        attemptsCount = 10
        correctCount = 9
      } else if (rand > 0.4) {
        // Fair (60-80%)
        attemptsCount = 10
        correctCount = 7
      } else {
        // Weak (<60%)
        attemptsCount = 10
        correctCount = 4
      }

      // Create attempts
      for (let i = 0; i < attemptsCount; i++) {
        await prisma.userAttempt.create({
          data: {
            userId: user.id,
            questionId: question.id,
            userAnswer: i < correctCount ? "a" : "b",
            isCorrect: i < correctCount,
            duration: 30
          }
        })
      }
      
      // ErrorBook 已下线，薄弱点由 attempts 实时聚合
    }
  }

  console.log('✨ Done! Added extra chapters with mock attempts.')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
