/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'

type ChapterSeed = {
  title: string
  children?: string[]
}

type SubjectSeed = {
  key: string
  name: string
  icon: string
  order: number
  replaceExistingTree?: boolean
  chapters: ChapterSeed[]
}

const prisma = new PrismaClient()

const SUBJECT_SEEDS: SubjectSeed[] = [
  {
    key: 'chinese',
    name: '中文',
    icon: 'BookOpen',
    order: 10,
    replaceExistingTree: true,
    chapters: [
      { title: '1.1 作文-记叙文、说明文、议论文' },
      { title: '1.2 作文-规范汉字与标点符号' },
      { title: '2.1 应用文-格式' },
      { title: '2.2 应用文-种类' },
      { title: '2.3 应用文-规范汉字与标点符号' },
      { title: '3.1 语文基础知识-语音与汉字' },
      { title: '3.2 语文基础知识-词语' },
      { title: '3.3 语文基础知识-句子' },
      { title: '3.4 语文基础知识-修辞' },
      { title: '3.5 语文基础知识-古典文学' },
      { title: '4.1 现代文阅读-文本' },
      { title: '4.2 现代文阅读-词语' },
      { title: '4.3 现代文阅读-写作技巧' },
      { title: '5.1 文言文阅读-文本' },
      { title: '5.2 文言文阅读-文言文基础' },
    ],
  },
  {
    key: 'malay',
    name: '马来西亚文',
    icon: 'Languages',
    order: 20,
    chapters: [{ title: 'Penulisan' }, { title: 'Kefahaman' }, { title: 'Tatabahasa' }],
  },
  {
    key: 'english',
    name: '英文',
    icon: 'Languages',
    order: 30,
    replaceExistingTree: true,
    chapters: [
      { title: '1.1 Context - Beliefs' },
      { title: '1.2 Context - Entertainment' },
      { title: '1.3 Context - Festivals' },
      { title: '1.4 Context - Food and Drinks' },
      { title: '1.5 Context - Giving Directions' },
      { title: '1.6 Context - Health and Exercise' },
      { title: '1.7 Context - History' },
      { title: '1.8 Context - Lifestyles' },
      { title: '1.9 Context - People' },
      { title: '1.10 Context - Places and Buildings' },
      { title: '1.11 Context - School and Study' },
      { title: '1.12 Context - Science and Technology' },
      { title: '1.13 Context - Social Issues and Civic-mindedness' },
      { title: '1.14 Context - The Natural World' },
      { title: '1.15 Context - Transport' },
      { title: '1.16 Context - Travel and Holidays' },
      { title: '1.17 Context - Work and Jobs' },
      { title: '2.1 Text Types - Articles and Reports' },
      { title: '2.2 Text Types - Conversations, Dialogues and Interviews' },
      { title: '2.3 Text Types - Descriptions of People, Things, Places, Scenes' },
      { title: '2.4 Text Types - Facts and Opinions' },
      { title: '2.5 Text Types - Journals and Diaries' },
      { title: '2.6 Text Types - Letters' },
      { title: '2.7 Text Types - Messages' },
      { title: '2.8 Text Types - Processes and Procedures' },
      { title: '2.9 Text Types - Speeches and Talks' },
      { title: '2.10 Text Types - Narratives' },
      { title: '3.1 Forms and Functions - Asking for and Giving Advice' },
      { title: '3.2 Forms and Functions - Expressing Agreement and Disagreement' },
      { title: '3.3 Forms and Functions - Arguments' },
      { title: '3.4 Forms and Functions - Asking for and Giving Directions' },
      { title: '3.5 Forms and Functions - Asking for and Giving Information' },
      { title: '3.6 Forms and Functions - Making Comparisons' },
      { title: '3.7 Forms and Functions - Making and Responding to Complaints' },
      { title: '3.8 Forms and Functions - Showing Concern' },
      { title: '3.9 Forms and Functions - Giving Descriptions' },
      { title: '3.10 Forms and Functions - Expressing Doubt' },
      { title: '3.11 Forms and Functions - Giving Encouragement' },
      { title: '3.12 Forms and Functions - Conveying Greetings' },
      { title: '3.13 Forms and Functions - Expressing Hesitation' },
      { title: '3.14 Forms and Functions - Making Introductions' },
      { title: '3.15 Forms and Functions - Expressing Likes and Dislikes' },
      { title: '3.16 Forms and Functions - Making Predictions' },
      { title: '3.17 Forms and Functions - Giving Offers' },
      { title: '3.18 Forms and Functions - Expressing Opinions' },
      { title: '3.19 Forms and Functions - Seeking and Granting Permission' },
      { title: '3.20 Forms and Functions - Expressing Possibility' },
      { title: '3.21 Forms and Functions - Making Promises' },
      { title: '3.22 Forms and Functions - Giving Reasons' },
      { title: '3.23 Forms and Functions - Making Requests' },
      { title: '3.24 Forms and Functions - Expressing Satisfaction and Dissatisfaction' },
      { title: '3.25 Forms and Functions - Making and Giving Suggestions' },
      { title: '3.26 Forms and Functions - Showing Sympathy' },
      { title: '3.27 Forms and Functions - Issuing Warning' },
      { title: '3.28 Forms and Functions - Making Enquiries' },
      { title: '3.29 Forms and Functions - Congratulations' },
      { title: '3.30 Forms and Functions - Making Apologies' },
      { title: '3.31 Forms and Functions - Extending Invitations' },
      { title: '4.1 Vocabulary - Glossary' },
      { title: '4.2 Vocabulary - Idioms' },
      { title: '4.3 Vocabulary - Proverbs' },
      { title: '4.4 Vocabulary - Phrasal Verbs' },
      { title: '4.5 Vocabulary - Synonyms' },
      { title: '5.1 Grammar - Nouns' },
      { title: '5.2 Grammar - Pronouns' },
      { title: '5.3 Grammar - Articles' },
      { title: '5.4 Grammar - Adjectives and Comparison of Adjectives' },
      { title: '5.5 Grammar - Adverbs' },
      { title: '5.6 Grammar - Prepositions' },
      { title: '5.7 Grammar - Conjunctions' },
      { title: '5.8 Grammar - Verbs' },
      { title: '5.9 Grammar - Infinitives and Gerunds' },
      { title: '5.10 Grammar - The Participles' },
      { title: '5.11 Grammar - The Conditional Tenses' },
      { title: '5.12 Grammar - Determiners' },
      { title: '5.13 Grammar - Modals' },
      { title: '5.14 Grammar - Direct and Indirect Speech' },
      { title: '5.15 Grammar - Question Tags' },
      { title: '5.16 Grammar - Negative Form and Interrogative Form' },
      { title: '5.17 Grammar - Punctuations' },
      { title: '5.18 Grammar - Phrases and Clauses' },
      { title: '5.19 Grammar - Sentence Types' },
    ],
  },
  {
    key: 'math',
    name: '数学',
    icon: 'Calculator',
    order: 40,
    replaceExistingTree: true,
    chapters: [
      { title: '1.1 算术 - 整数' },
      { title: '1.2 算术 - 自然数' },
      { title: '1.3 算术 - 分数' },
      { title: '1.4 算术 - 小数' },
      { title: '1.5 算术 - 百分数' },
      { title: '1.6 算术 - 比与比例' },
      { title: '1.7 算术 - 记数制度' },
      { title: '1.8 算术 - 度量衡基本单位' },
      { title: '2.1 代数 - 代数式' },
      { title: '2.2 代数 - 平方根与立方根' },
      { title: '2.3 代数 - 多项式' },
      { title: '2.4 代数 - 因式分解' },
      { title: '2.5 代数 - 方程式' },
      { title: '2.6 代数 - 直角坐标系与图像' },
      { title: '2.7 代数 - 分式' },
      { title: '2.8 代数 - 公式' },
      { title: '2.9 代数 - 不等式' },
      { title: '2.10 代数 - 变数法' },
      { title: '2.11 代数 - 指数与对数' },
      { title: '3.1 几何 - 几何的基本概念' },
      { title: '3.2 几何 - 三角形' },
      { title: '3.3 几何 - 四边形与多边形' },
      { title: '3.4 几何 - 周长面积表面积体积' },
      { title: '3.5 几何 - 轨迹' },
      { title: '3.6 几何 - 毕氏定理' },
      { title: '3.7 几何 - 相似形' },
      { title: '3.8 几何 - 圆' },
      { title: '3.9 几何 - 几何变换' },
      { title: '3.10 几何 - 三角函数' },
      { title: '4.1 统计学 - 统计表与统计图' },
      { title: '4.2 统计学 - 集中趋势与四分位数' },
      { title: '5.1 集合论 - 集合' },
      { title: '5.2 集合论 - 集合论的应用' },
    ],
  },
  {
    key: 'science',
    name: '科学',
    icon: 'Atom',
    order: 50,
    replaceExistingTree: true,
    chapters: [
      { title: '1.1 走入科学世界 - 科学探究' },
      { title: '1.2 走入科学世界 - 科学实验室' },
      { title: '1.3 走入科学世界 - 单位与测量' },
      { title: '2.1 生命科学 - 生命的现象' },
      { title: '2.2 生命科学 - 生物体的组成' },
      { title: '2.3.1 生命科学 - 营养与健康' },
      { title: '2.3.2 生命科学 - 光合作用' },
      { title: '2.3.3 生命科学 - 消化和吸收' },
      { title: '2.3.4 生命科学 - 呼吸' },
      { title: '2.3.5 生命科学 - 物质的运输' },
      { title: '2.3.6 生命科学 - 协调与恒定' },
      { title: '2.3.7 生命科学 - 生殖与发育' },
      { title: '2.3.8 生命科学 - 遗传与演化' },
      { title: '2.4 生命科学 - 生物与环境—生态系统' },
      { title: '2.5 生命科学 - 生物的多样性' },
      { title: '3.1 物质科学 - 物体与物质' },
      { title: '3.2 物质科学 - 质量守恒定律' },
      { title: '3.3.1 物质科学 - 能源与能量' },
      { title: '3.3.2 物质科学 - 热' },
      { title: '3.3.3 物质科学 - 波' },
      { title: '3.3.4 物质科学 - 光与色' },
      { title: '3.3.5 物质科学 - 电与磁' },
      { title: '3.4 物质科学 - 力与运动' },
      { title: '4.1 地球、宇宙与空间科学 - 地球运动与效应' },
      { title: '4.2 地球、宇宙与空间科学 - 地球的概貌' },
      { title: '4.3.1 地球、宇宙与空间科学 - 土壤' },
      { title: '4.3.2 地球、宇宙与空间科学 - 岩石' },
      { title: '4.3.3 地球、宇宙与空间科学 - 矿物' },
      { title: '4.3.4 地球、宇宙与空间科学 - 水' },
      { title: '4.3.5 地球、宇宙与空间科学 - 大气' },
      { title: '4.3.6 地球、宇宙与空间科学 - 生物' },
      { title: '4.4.1 地球、宇宙与空间科学 - 太阳系' },
      { title: '4.4.2 地球、宇宙与空间科学 - 星与星系' },
      { title: '4.4.3 地球、宇宙与空间科学 - 宇宙' },
      { title: '4.4.4 地球、宇宙与空间科学 - 天文与太空探索的发展' },
    ],
  },
  {
    key: 'history',
    name: '历史',
    icon: 'Landmark',
    order: 60,
    replaceExistingTree: true,
    chapters: [
      { title: '1.1.1 马来西亚史部分 - 马六甲王国的建国经过' },
      { title: '1.1.2 马来西亚史部分 - 葡萄牙与荷兰对马六甲的殖民统治' },
      { title: '1.1.3 马来西亚史部分 - 柔佛王国的兴衰（含三角战争）' },
      { title: '1.1.4 马来西亚史部分 - 马来社会与文化' },
      { title: '1.2.1 马来西亚史部分 - 海峡殖民地的组成' },
      { title: '1.2.2 马来西亚史部分 - 英国干涉马来土邦的经过' },
      { title: '1.3.1 马来西亚史部分 - 马来属邦' },
      { title: '1.3.2 马来西亚史部分 - 英国在北婆罗洲的扩张' },
      { title: '1.3.3 马来西亚史部分 - 我国反殖民统治的行动' },
      { title: '1.4.1 马来西亚史部分 - 英殖民统治下的经济、社会、教育与文化发展概况' },
      { title: '1.5.1 马来西亚史部分 - 日本入侵我国的经过、统治政策以及人民展开的抗日斗争' },
      { title: '1.6.1 马来西亚史部分 - 婆罗洲战争与砂捞越会谈' },
      { title: '1.6.2 马来西亚史部分 - 马来亚联邦和马来亚联合邦' },
      { title: '1.7.1 马来西亚史部分 - 马来亚独立的经过' },
      { title: '1.7.2 马来西亚史部分 - 五一三事件及其后续发展' },
      { title: '1.7.3 马来西亚史部分 - 新经济政策' },
      { title: '1.7.4 马来西亚史部分 - 我国教育政策与华教发展' },
      { title: '1.7.5 马来西亚史部分 - 我国积极参与的国际性组织——东盟' },
      { title: '2.1.1 世界史部分 - 历史的概念' },
      { title: '2.1.2 世界史部分 - 世界四大古文明' },
      { title: '2.1.3 世界史部分 - 世界三大宗教' },
      { title: '2.2.1 中国古代史 - 中国各朝代的顺序' },
      { title: '2.2.2 中国古代史 - 周朝的封建制度和宗法制度' },
      { title: '2.2.3 中国古代史 - 秦始皇的功绩' },
      { title: '2.2.4 中国古代史 - 汉武帝的政绩与丝绸之路' },
      { title: '2.2.5 中国古代史 - 魏晋南北朝的民族融合' },
      { title: '2.2.6 中国古代史 - 隋朝的重要建设' },
      { title: '2.2.7 中国古代史 - 唐太宗的政绩与东来的唐化运动' },
      { title: '2.2.8 中国古代史 - 宋朝的政治发展' },
      { title: '2.2.9 中国古代史 - 元朝兴亡' },
      { title: '2.2.10 中国古代史 - 明朝专制与郑和下西洋' },
      { title: '2.2.11 中国古代史 - 清朝前期的盛世' },
      { title: '2.2.12 中国古代史 - 中国文化之代表及特色' },
      { title: '2.3.1 中国近现代史 - 鸦片战争' },
      { title: '2.3.2 中国近现代史 - 洋务运动与变法维新' },
      { title: '2.3.3 中国近现代史 - 辛亥革命与中华民国的建立' },
      { title: '2.3.4 中国近现代史 - 东南沿海人民移居海外' },
      { title: '2.3.5 中国近现代史 - 新文化运动与五四运动' },
      { title: '2.3.6 中国近现代史 - 中华人民共和国的发展' },
      { title: '2.4.1 南亚及东南亚史 - 东南亚各国沦为殖民地' },
      { title: '2.4.2 南亚及东南亚史 - 东南亚各国的独立与发展' },
      { title: '2.4.3 南亚及东南亚史 - 暹罗的不同发展' },
      { title: '2.4.4 南亚及东南亚史 - 印度甘地的不合作运动及其独立经过' },
      { title: '2.5.1 欧洲古代史 - 古希腊城邦政治' },
      { title: '2.5.2 欧洲古代史 - 罗马帝国的兴衰及其法律制度' },
      { title: '2.5.3 欧洲古代史 - 中古欧洲的政治、经济和社会特色' },
      { title: '2.5.4 欧洲古代史 - 近代欧洲的兴起' },
      { title: '2.5.5 欧洲古代史 - 欧洲的文化演进特色' },
      { title: '2.6.1 欧洲近现代史 - 英国君主立宪制的确立及责任内阁制' },
      { title: '2.6.2 欧洲近现代史 - 启蒙运动' },
      { title: '2.6.3 欧洲近现代史 - 美国独立战争' },
      { title: '2.6.4 欧洲近现代史 - 法国大革命' },
      { title: '2.6.5 欧洲近现代史 - 拿破仑称霸欧洲' },
      { title: '2.6.6 欧洲近现代史 - 工业革命' },
      { title: '2.6.7 欧洲近现代史 - 第一次世界大战' },
      { title: '2.6.8 欧洲近现代史 - 苏联的崛起' },
      { title: '2.6.9 欧洲近现代史 - 第二次世界大战之背景、经过及影响' },
      { title: '2.6.10 欧洲近现代史 - 重要国际组织——联合国及欧盟' },
      { title: '2.6.11 欧洲近现代史 - 冷战' },
    ],
  },
  {
    key: 'geography',
    name: '地理',
    icon: 'Globe',
    order: 70,
    replaceExistingTree: true,
    chapters: [
      { title: '1.1 读图解图 - 平面图与地图' },
      { title: '1.2 读图解图 - 地图的判读' },
      { title: '2.1 地理资料的收集与处理 - 地理资料的收集' },
      { title: '2.2 地理资料的收集与处理 - 统计图' },
      { title: '3.1 马来西亚地理 - 地理位置' },
      { title: '3.2 马来西亚地理 - 地形' },
      { title: '3.3 马来西亚地理 - 气候' },
      { title: '3.4 马来西亚地理 - 河流' },
      { title: '3.5 马来西亚地理 - 森林' },
      { title: '3.6 马来西亚地理 - 人类活动与自然环境的关系' },
      { title: '3.7 马来西亚地理 - 人口' },
      { title: '3.8 马来西亚地理 - 聚落' },
      { title: '3.9 马来西亚地理 - 交通' },
      { title: '3.10 马来西亚地理 - 农业' },
      { title: '3.11 马来西亚地理 - 渔业' },
      { title: '3.12 马来西亚地理 - 矿业' },
      { title: '3.13 马来西亚地理 - 能源' },
      { title: '3.14 马来西亚地理 - 工业' },
      { title: '3.15 马来西亚地理 - 服务业' },
      { title: '3.16 马来西亚地理 - 经济活动' },
      { title: '4.1 自然地理 - 地球' },
      { title: '4.2 自然地理 - 陆地与海洋' },
      { title: '4.3 自然地理 - 板块运动' },
      { title: '4.4 自然地理 - 地震' },
      { title: '4.5 自然地理 - 火山' },
      { title: '4.6 自然地理 - 河流地形与海岸地形' },
      { title: '4.7 自然地理 - 石灰岩地形、干旱地形、平原地形' },
      { title: '4.8 自然地理 - 冰河地形' },
      { title: '4.9 自然地理 - 地形的开发与利用' },
      { title: '4.10 自然地理 - 气候' },
      { title: '4.11 自然地理 - 自然景观' },
      { title: '5.1 人文地理 - 自然资源' },
      { title: '5.2 人文地理 - 土地资源' },
      { title: '5.3 人文地理 - 森林资源' },
      { title: '5.4 人文地理 - 水资源' },
      { title: '5.5 人文地理 - 矿产资源' },
      { title: '5.6 人文地理 - 能源' },
      { title: '5.7 人文地理 - 国家、世界文化与国际组织' },
      { title: '5.8 人文地理 - 世界人口' },
      { title: '5.9 人文地理 - 城市化' },
      { title: '5.10 人文地理 - 世界交通、资讯、贸易与全球化' },
      { title: '6.1 全球议题 - 自然景观带的开发与环境问题' },
      { title: '6.2 全球议题 - 全球暖化' },
      { title: '6.3 全球议题 - 河水泛滥' },
      { title: '6.4 全球议题 - 荒漠化' },
      { title: '6.5 全球议题 - 饥荒' },
    ],
  },
]

const DEMO_SUFFIXES = ['Introduction', 'Advanced Concepts', 'Practical Applications']

function hasApplyFlag() {
  return process.argv.includes('--apply')
}

function getDemoTitleFilters() {
  return DEMO_SUFFIXES.map((suffix) => ({
    title: { endsWith: ` - ${suffix}` },
  }))
}

async function ensureChapter({
  subjectId,
  title,
  parentId,
  order,
  dryRun,
}: {
  subjectId: string
  title: string
  parentId: string | null
  order: number
  dryRun: boolean
}) {
  const existing = await prisma.chapter.findFirst({
    where: { subjectId, title, parentId },
    orderBy: { createdAt: 'asc' },
  })

  if (existing) {
    if (dryRun) {
      console.log(`  = 保留章节: ${title}`)
      return existing
    }

    return prisma.chapter.update({
      where: { id: existing.id },
      data: { order, parentId },
    })
  }

  if (dryRun) {
    console.log(`  + 新建章节: ${title}`)
    return { id: `dry-run:${subjectId}:${title}`, subjectId, parentId, title, order } as const
  }

  return prisma.chapter.create({
    data: {
      subjectId,
      parentId,
      title,
      order,
    },
  })
}

async function seedSubject(seed: SubjectSeed, dryRun: boolean) {
  const subject = await prisma.subject.upsert({
    where: { key: seed.key },
    update: {
      name: seed.name,
      icon: seed.icon,
      order: seed.order,
    },
    create: {
      key: seed.key,
      name: seed.name,
      icon: seed.icon,
      order: seed.order,
    },
  })

  console.log(`\n处理科目: ${seed.name} (${seed.key})`)

  if (seed.replaceExistingTree) {
    const existingChapters = await prisma.chapter.findMany({
      where: { subjectId: subject.id },
      select: {
        id: true,
        title: true,
        parentId: true,
        _count: {
          select: {
            questions: true,
            lessons: true,
          },
        },
      },
    })

    const occupiedChapter = existingChapters.find(
      (chapter) => chapter._count.questions > 0 || chapter._count.lessons > 0,
    )

    if (occupiedChapter) {
      throw new Error(
        `科目 ${seed.key} 存在已挂内容的章节，停止替换：${occupiedChapter.title}`,
      )
    }

    if (existingChapters.length > 0) {
      console.log(`  - 重建章节树，清理旧章节 ${existingChapters.length} 个`)
      if (!dryRun) {
        await prisma.chapter.deleteMany({
          where: {
            subjectId: subject.id,
            parentId: { not: null },
          },
        })
        await prisma.chapter.deleteMany({
          where: {
            subjectId: subject.id,
            parentId: null,
          },
        })
      }
    }
  }

  const demoChapters = await prisma.chapter.findMany({
    where: {
      subjectId: subject.id,
      parentId: null,
      OR: getDemoTitleFilters(),
    },
    select: { id: true, title: true },
  })

  if (demoChapters.length > 0) {
    console.log(`  - 清理 demo 章节 ${demoChapters.length} 个`)
    if (!dryRun) {
      await prisma.chapter.deleteMany({
        where: { id: { in: demoChapters.map((chapter) => chapter.id) } },
      })
    }
  }

  for (const [rootIndex, chapter] of seed.chapters.entries()) {
    const rootOrder = (rootIndex + 1) * 100
    const root = await ensureChapter({
      subjectId: subject.id,
      title: chapter.title,
      parentId: null,
      order: rootOrder,
      dryRun,
    })

    for (const [childIndex, childTitle] of (chapter.children ?? []).entries()) {
      await ensureChapter({
        subjectId: subject.id,
        title: childTitle,
        parentId: root.id,
        order: rootOrder + childIndex + 1,
        dryRun,
      })
    }
  }
}

async function main() {
  const dryRun = !hasApplyFlag()

  console.log(dryRun ? '运行模式: dry-run' : '运行模式: apply')
  console.log('目标: 建立 UEC 科目章节树，只处理章节，不写题目')

  for (const seed of SUBJECT_SEEDS) {
    await seedSubject(seed, dryRun)
  }

  console.log('\n完成。')
}

main()
  .catch((error) => {
    console.error('章节入库失败:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
