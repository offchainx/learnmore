import { PrismaClient } from '@prisma/client'
require('dotenv').config({ path: './.env.local' })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种数据...')

  // 创建学科
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name: '数学' },
      update: {},
      create: { name: '数学', icon: '🔢', order: 1 },
    }),
    prisma.subject.upsert({
      where: { name: '物理' },
      update: {},
      create: { name: '物理', icon: '⚛️', order: 2 },
    }),
    prisma.subject.upsert({
      where: { name: '化学' },
      update: {},
      create: { name: '化学', icon: '🧪', order: 3 },
    }),
    prisma.subject.upsert({
      where: { name: '英语' },
      update: {},
      create: { name: '英语', icon: '🔤', order: 4 },
    }),
    prisma.subject.upsert({
      where: { name: '语文' },
      update: {},
      create: { name: '语文', icon: '📖', order: 5 },
    }),
    prisma.subject.upsert({
      where: { name: '生物' },
      update: {},
      create: { name: '生物', icon: '🧬', order: 6 },
    }),
  ])

  console.log(`✅ 创建了 ${subjects.length} 个学科`)

  // 创建数学章节示例 (3层嵌套)
  const mathSubject = subjects[0]
  const chapter1 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      title: '一元二次方程',
      order: 1,
    },
  })

  await prisma.chapter.createMany({
    data: [
      {
        subjectId: mathSubject.id,
        parentId: chapter1.id,
        title: '1.1 方程的解',
        order: 1,
      },
      {
        subjectId: mathSubject.id,
        parentId: chapter1.id,
        title: '1.2 配方法',
        order: 2,
      },
    ],
  })

  console.log('✅ 创建了示例章节')

  // 创建示例题目
  await prisma.question.create({
    data: {
      chapterId: chapter1.id,
      type: 'SINGLE_CHOICE',
      difficulty: 3,
      content: '求解方程 $x^2 + 2x + 1 = 0$ 的根',
      options: {
        A: 'x = -1',
        B: 'x = 1',
        C: 'x = 0',
        D: '无实根',
      },
      answer: 'A',
      explanation: '分解因式: $(x+1)^2 = 0$,得 $x = -1$',
    },
  })

  console.log('✅ 创建了示例题目')

  console.log('🎉 数据播种完成!')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })