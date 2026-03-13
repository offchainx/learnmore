import { redirect } from 'next/navigation';
import { ContentStatus, Question, QuestionType } from '@prisma/client';
import { getCurrentUser } from '@/actions/user/auth';
import { getChapterWithStats, getRandomQuestions } from '@/actions/practice/data-service';
import { QuizView } from '@/components/business/quiz/QuizView';
import prisma from '@/lib/prisma';
import type { ChapterWithStats } from '@/lib/practice/types';

interface PageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

const PREVIEW_CHAPTER_TITLES: Record<string, string> = {
  'preview-w1': '应用题拆解',
  'preview-w2': '多步骤推理',
  'preview-w3': '高频易错点',
  'preview-w4': '计算稳定性',
  'preview-1': '基础概念',
  'preview-2': '题型辨析',
  'preview-3': '应用理解',
  'preview-4': '综合推理',
  'preview-5': '审题速度',
  'preview-6': '易错修复',
  'preview-7': '进阶变式',
  'preview-8': '限时稳定',
  'preview-9': '冲刺专题',
};

function isPreviewChapterId(chapterId: string) {
  return chapterId.startsWith('preview-');
}

function buildPreviewChapter(chapterId: string): ChapterWithStats {
  const title = PREVIEW_CHAPTER_TITLES[chapterId] ?? '章节预览';

  return {
    id: chapterId,
    title,
    subjectId: 'preview',
    parentId: null,
    order: 0,
    stats: {
      totalAttempts: 8,
      correctCount: 4,
      masteryLevel: 56,
      questionCount: 12,
      recentAttempts: 4,
      recentCorrectRate: 58,
      monthlyCorrectRate: 61,
    },
  };
}

function createMockQuestion(
  chapterId: string,
  subjectId: string,
  overrides: Partial<Question> & Pick<Question, 'id' | 'content' | 'type' | 'answer'>,
): Question {
  const { id, type, content, answer, ...rest } = overrides;

  return {
    id,
    curriculum: 'UEC',
    grade: 8,
    chapterId,
    subjectId,
    difficulty: 3,
    type,
    content,
    options: null,
    answer,
    explanation: overrides.explanation ?? '这是一条用于章节地图答题页预览的 mock 解析。',
    contentHash: null,
    createdAt: new Date('2026-03-12T00:00:00.000Z'),
    createdBy: null,
    reviewedAt: new Date('2026-03-12T00:00:00.000Z'),
    reviewedBy: null,
    publishedAt: new Date('2026-03-12T00:00:00.000Z'),
    publishedBy: null,
    qualityScore: 90,
    reportCount: 0,
    status: ContentStatus.PUBLISHED,
    updatedAt: new Date('2026-03-12T00:00:00.000Z'),
    sourceFileId: null,
    assetUrl: null,
    imageUrls: [],
    source: 'Chapter Map Mock Preview',
    tags: ['chapter-map', 'mock-preview'],
    isPastPaper: false,
    paperId: null,
    ...rest,
  };
}

export default async function ChapterDrillPage({ params }: PageProps) {
  const { chapterId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const previewChapter = isPreviewChapterId(chapterId) ? buildPreviewChapter(chapterId) : null;
  const chapter = previewChapter ?? (await getChapterWithStats(chapterId, user.id));

  if (!chapter) {
    redirect('/dashboard/practice');
  }

  const [subject, questions] = previewChapter
    ? await Promise.all([
        Promise.resolve({ name: '练习预览' }),
        Promise.resolve<Question[]>([]),
      ])
    : await Promise.all([
        prisma.subject.findUnique({
          where: { id: chapter.subjectId },
          select: { name: true },
        }),
        getRandomQuestions({
          chapterIds: [chapterId],
          limit: 20,
          userId: user.id,
        }),
      ]);

  const publishedQuestions = questions.filter((question) => question.status === ContentStatus.PUBLISHED);
  const fallbackQuestions: Question[] = [
    createMockQuestion(chapterId, chapter.subjectId, {
      id: `${chapterId}-mock-1`,
      type: QuestionType.SINGLE_CHOICE,
      content: `【${chapter.title}】若 \\(3x + 5 = 20\\)，则 \\(x\\) 的值是？`,
      options: { A: '3', B: '4', C: '5', D: '6' },
      answer: 'C',
      difficulty: 2,
    }),
    createMockQuestion(chapterId, chapter.subjectId, {
      id: `${chapterId}-mock-2`,
      type: QuestionType.MULTIPLE_CHOICE,
      content: `【${chapter.title}】下列哪些选项属于本章节常见考点？`,
      options: { A: '基础概念辨析', B: '核心公式应用', C: '跨题型变式', D: '无关记忆题' },
      answer: ['A', 'B', 'C'],
      difficulty: 3,
    }),
    createMockQuestion(chapterId, chapter.subjectId, {
      id: `${chapterId}-mock-3`,
      type: QuestionType.FILL_BLANK,
      content: `【${chapter.title}】请填写：本轮章节练习用于预览统一答题页的 ______ 内容。`,
      answer: 'mock',
      difficulty: 1,
    }),
  ];
  const displayQuestions = publishedQuestions.length > 0 ? publishedQuestions : fallbackQuestions;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 py-2 sm:px-4 sm:py-4">
      <QuizView
        userId={user.id}
        title={chapter.title}
        modeLabel="Chapter Map"
        subtitle={`${subject?.name || '当前科目'} · 当前章节定向练习，整组完成后一次性交卷。`}
        mode="CHAPTER_DRILL"
        chapterId={chapterId}
        subjectId={chapter.subjectId}
        questions={displayQuestions}
        submitLabel="提交章节练习"
        refreshLabel="换一组题"
        exitLabel="退出章节练习"
        resultTitle="章节练习完成"
        resultSubtitle="当前章节这一轮已经完成，下面是本轮结果摘要。"
        recommendation={
          previewChapter
            ? '这是薄弱点快修/知识蜂巢的 mock 章节预览，主要用于确认进入章节练习后的统一答题流程。'
            : chapter.stats.masteryLevel < 70
            ? '这一章还需要继续加练，建议提交后再刷一轮，或回到练习中心查看其他薄弱章节。'
            : '这一章整体表现已经稳定，可以回到练习中心切到 Smart Drill 或历年真题继续。'
        }
        theme="amber"
        rightPanelNote={
          previewChapter
            ? '当前入口来自右侧分析卡片，这里先用 mock 题承接预览章节，避免 preview id 进入真实 Prisma 查询。'
            : publishedQuestions.length > 0
            ? '章节地图更适合定向补弱。建议先完整做完这一章的整组题，再回看章节正确率和题型波动。'
            : '当前章节暂时没有真实题目，这里先用 mock 题帮你确认跳转和统一答题页逻辑。'
        }
      />
    </div>
  );
}
