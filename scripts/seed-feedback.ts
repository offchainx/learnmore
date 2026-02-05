import { PrismaClient, FeedbackCategory, FeedbackStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding feedback data...');

  // 获取一个管理员用户用于测试（可选）
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  const feedbacks = [
    {
      email: 'student1@example.com',
      title: '数学错题本加载缓慢',
      content: '当我尝试打开高一数学第一章的错题本时，页面加载需要超过10秒。',
      category: FeedbackCategory.BUG,
      status: FeedbackStatus.PENDING,
    },
    {
      email: 'parent_test@gmail.com',
      title: '建议增加家长监督功能',
      content: '希望能增加一个家长端，可以实时看到孩子的学习进度和模拟考成绩。',
      category: FeedbackCategory.SUGGESTION,
      status: FeedbackStatus.IN_PROGRESS,
    },
    {
      email: 'user456@163.com',
      title: '物理公式显示错误',
      content: '动能定理部分的 LaTeX 公式在手机端显示不全，出现了重叠。',
      category: FeedbackCategory.CONTENT_ISSUE,
      status: FeedbackStatus.PENDING,
    },
    {
      email: 'vip_user@learnmore.ai',
      title: '感谢你们的平台！',
      content: 'AI 导师功能非常好用，对我理解复杂的化学方程式很有帮助。',
      category: FeedbackCategory.SUGGESTION,
      status: FeedbackStatus.RESOLVED,
      adminReply: '非常感谢您的反馈！我们会继续努力提升 AI 导师的智能化水平。',
      repliedAt: new Date(),
    }
  ];

  for (const f of feedbacks) {
    await prisma.userFeedback.create({
      data: f
    });
  }

  console.log('Feedback data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
