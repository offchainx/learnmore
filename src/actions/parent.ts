'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { revalidatePath } from 'next/cache'

/**
 * 学生生成 6 位邀请码
 */
export async function generateInviteCode() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'STUDENT') {
    return { success: false, error: 'Only students can generate invite codes.' }
  }

  // 生成随机 6 位大写字母数字组合
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24小时有效

  try {
    const invite = await prisma.inviteCode.create({
      data: {
        code,
        studentId: user.id,
        expiresAt,
      },
    })
    return { success: true, code: invite.code }
  } catch (error) {
    console.error('Error generating invite code:', error)
    return { success: false, error: 'Failed to generate code.' }
  }
}

/**
 * 家长绑定学生
 */
export async function bindStudent(code: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'PARENT') {
    return { success: false, error: 'Only parents can bind students.' }
  }

  try {
    const invite = await prisma.inviteCode.findFirst({
      where: {
        code: code.toUpperCase(),
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!invite) {
      return { success: false, error: 'Invalid or expired invite code.' }
    }

    // 创建关联
    await prisma.$transaction([
      prisma.parentStudent.create({
        data: {
          parentId: user.id,
          studentId: invite.studentId,
        },
      }),
      prisma.inviteCode.update({
        where: { id: invite.id },
        data: { used: true },
      }),
    ])

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error binding student:', error)
    return { success: false, error: 'Binding failed.' }
  }
}

/**
 * 获取家长关联的所有学生
 */
export async function getLinkedStudents() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'PARENT') return []

  const links = await prisma.parentStudent.findMany({
    where: { parentId: user.id },
    include: {
      student: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          grade: true,
        },
      },
    },
  })

  return links.map((l) => l.student)
}

/**
 * 获取学生的详细学习统计 (家长视角)
 */
export async function getStudentStats(studentId: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'PARENT') {
    console.error('getStudentStats: Unauthorized access attempt')
    return null
  }

  try {
    // 验证关联关系
    const link = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: user.id,
          studentId,
        },
      },
    })

    if (!link) {
      console.error(`getStudentStats: No link found between parent ${user.id} and student ${studentId}`)
      return null
    }

    const [student, progressCount, errorCount, recentAttempts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: {
          username: true,
          totalStudyTime: true,
          xp: true,
          streak: true,
          grade: true,
        }
      }),
      prisma.userProgress.count({
        where: { userId: studentId, isCompleted: true }
      }),
      prisma.errorBook.count({
        where: { userId: studentId }
      }),
      prisma.userAttempt.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          question: {
            include: {
              chapter: {
                include: { subject: true }
              }
            }
          }
        }
      })
    ])

    // 计算平均正确率
    const totalAttempts = await prisma.userAttempt.count({ where: { userId: studentId } })
    const correctAttempts = await prisma.userAttempt.count({ where: { userId: studentId, isCorrect: true } })
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0

    return {
      student,
      stats: {
        completedLessons: progressCount || 0,
        totalStudyTime: student?.totalStudyTime || 0,
        xp: student?.xp || 0,
        streak: student?.streak || 0,
        errorCount: errorCount || 0,
        accuracy: Math.round(accuracy),
      },
      recentActivities: (recentAttempts || []).map(a => ({
        id: a.id,
        type: 'practice',
        title: `Practiced ${a.question?.chapter?.subject?.name || 'Subject'}`,
        subtitle: a.question?.chapter?.title || 'Unknown Lesson',
        time: a.createdAt,
        result: a.isCorrect ? 'correct' : 'incorrect'
      }))
    }
  } catch (error) {
    console.error('getStudentStats: Unexpected error:', error)
    return null
  }
}
