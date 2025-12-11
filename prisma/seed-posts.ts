/* eslint-disable no-console */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding posts...');

  // 1. Get existing users and subjects
  const users = await prisma.user.findMany();
  const subjects = await prisma.subject.findMany();

  if (users.length === 0 || subjects.length === 0) {
    console.error('No users or subjects found. Please run main seed first.');
    return;
  }

  // 2. Create posts
  const postsData = [
    {
      title: '如何高效学习微积分？',
      content: '大家在学习微积分的时候有什么好的方法吗？我觉得极限部分很难理解。有没有推荐的视频或者教材？',
      subjectName: '数学',
      authorIndex: 0,
      likes: 12,
      comments: 3
    },
    {
      title: '牛顿第二定律的应用困惑',
      content: '在处理斜面问题时，受力分析总是出错，特别是摩擦力的方向。求大神指点！',
      subjectName: '物理',
      authorIndex: 0, // Same author
      likes: 5,
      comments: 1
    },
    {
      title: '化学方程式配平技巧',
      content: '氧化还原反应的配平总是配不平，有什么万能公式吗？',
      subjectName: '化学',
      authorIndex: 0, 
      likes: 8,
      comments: 0
    },
    {
      title: '英语阅读理解提分攻略',
      content: '每次做阅读理解都超时，而且正确率不高。是不是词汇量的问题？',
      subjectName: '英语',
      authorIndex: 0,
      likes: 24,
      comments: 5
    },
    {
      title: '文言文实词积累',
      content: '常见的文言文实词有哪些？求整理好的文档。',
      subjectName: '语文',
      authorIndex: 0,
      likes: 2,
      comments: 0
    },
    // More posts for pagination testing
    ...Array.from({ length: 15 }).map((_, i) => ({
      title: `数学每日一题 - Day ${i + 1}`,
      content: `今天的题目是关于三角函数的... 题目详情见图片（假装有图）。\n\n大家把答案写在评论区！`,
      subjectName: '数学',
      authorIndex: 0,
      likes: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 5)
    }))
  ];

  for (const post of postsData) {
    const subject = subjects.find(s => s.name === post.subjectName);
    const author = users[post.authorIndex % users.length]; // Cycle through users if more posts than users

    if (subject && author) {
      await prisma.post.create({
        data: {
          title: post.title,
          content: post.content,
          authorId: author.id,
          subjectId: subject.id,
          likeCount: post.likes,
          // Create some dummy comments if needed, but for now just posts
          comments: {
            create: Array.from({ length: post.comments }).map((_, i) => ({
              content: `This is a comment ${i + 1}`,
              authorId: users[(i + 1) % users.length].id
            }))
          }
        }
      });
      console.log(`Created post: ${post.title}`);
    }
  }

  console.log('Seeding posts finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
