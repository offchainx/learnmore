import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { DbSubject, PracticeSubjectData } from './types'
import {
  fetchWithTimeout,
  isAbortLikeError,
} from '@/lib/http/fetch-with-timeout'
import { useApp } from '@/providers'
import {
  getSubjectLabel,
  resolveSubjectKeyFromName,
  SUBJECT_DEFINITIONS,
} from '@/lib/subjects'

import { PracticeSubjectBar } from './SubjectSelector'
import { PracticeModeGrid } from './TrainingModeCards'
import { ChapterProgressSection } from './ChapterMap'
import { PastPaperLibrarySection } from './PastPapersSection'
import { PracticeCoachPanel } from './AnalyticsSidebar'
import {
  PracticeModePreviewDialog,
  type PracticeModePreviewConfig,
} from './PracticeModePreviewDialog'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import {
  pageHeroShellClass,
  pagePanelClass,
  pageShellFrameClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardPaddingClass,
  pageGridGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'
import { pageHeroEyebrowClass } from '@/components/shared/pageTypography'
import { parseStructuredChapterTitle } from './chapterDisplay'

interface PracticeCenterScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
  initialSubjectId?: string
}

function createEmptySubjectData(): PracticeSubjectData {
  return {
    chapters: [],
    pastPapers: [],
    knowledgeHive: [],
    examForecast: null,
  }
}

function normalizeClientSubjects(subjects: DbSubject[]): DbSubject[] {
  const byKey = new Map<string, DbSubject>()

  for (const subject of subjects) {
    const resolvedKey = subject.key || resolveSubjectKeyFromName(subject.name)
    if (!resolvedKey) continue
    if (byKey.has(resolvedKey)) continue
    byKey.set(resolvedKey, { ...subject, key: resolvedKey })
  }

  return SUBJECT_DEFINITIONS.map((definition) =>
    byKey.get(definition.key)
  ).filter((subject): subject is DbSubject => Boolean(subject))
}

const CHINESE_CHAPTER_PREVIEW_NOTES: Record<
  string,
  { preview?: string; supplement?: string }
> = {
  '1.1 作文-记叙文、说明文、议论文': {},
  '1.2 作文-规范汉字与标点符号': {},
  '2.1 应用文-格式': {
    supplement: '公函、通告、启事',
  },
  '2.2 应用文-种类': {
    supplement: '公函、通告、启事',
  },
  '2.3 应用文-规范汉字与标点符号': {},
  '3.1 语文基础知识-语音与汉字': {
    preview: '3.1.1 华语的声韵调；3.1.2 规范的汉字',
  },
  '3.2 语文基础知识-词语': {
    preview:
      '3.2.1 词语（包括成语）的含义；3.2.2 词语（包括成语）的感情色彩',
  },
  '3.3 语文基础知识-句子': {
    preview:
      '3.3.1 单句成分：主、谓、宾、定、状、补；3.3.2 复句类型：并列、承接、递进、选择、转折、因果、假设、条件',
  },
  '3.4 语文基础知识-修辞': {
    preview:
      '3.4.1 比喻、比拟、借代、引用、夸张、回文、顶真、设问、反问、排比、反复、对偶、对比',
  },
  '3.5 语文基础知识-古典文学': {},
  '4.1 现代文阅读-文本': {},
  '4.2 现代文阅读-词语': {},
  '4.3 现代文阅读-写作技巧': {},
  '5.1 文言文阅读-文本': {},
  '5.2 文言文阅读-文言文基础': {},
}

const ENGLISH_CHAPTER_PREVIEW_NOTES: Record<
  string,
  { preview?: string; supplement?: string }
> = {
  '5.1 Grammar - Nouns': {
    preview: '5.1.1 Countable and Uncountable Nouns；5.1.2 Collective Nouns',
  },
  '5.2 Grammar - Pronouns': {
    preview:
      '5.2.1 Subject Pronouns and Object Pronouns；5.2.2 Possessive Adjectives and Possessive Pronouns；5.2.3 Reflexive Pronouns；5.2.4 Possessive Nouns；5.2.5 Relative Pronouns；5.2.6 Interrogative Pronouns；5.2.7 Indefinite Pronouns',
  },
  '5.3 Grammar - Articles': {
    preview: '5.3.1 A, An, The；5.3.2 Zero Articles',
  },
  '5.5 Grammar - Adverbs': {
    preview:
      '5.5.1 Adverbs of Manner；5.5.2 Adverbs of Frequency；5.5.3 Adverbs of Time；5.5.4 Adverbs of Degree；5.5.5 Adverbs of Place；5.5.6 Comparison of Adverbs',
  },
  '5.6 Grammar - Prepositions': {
    preview:
      '5.6.1 Prepositions of Place；5.6.2 Prepositions of Time；5.6.3 Prepositions of Direction',
  },
  '5.8 Grammar - Verbs': {
    preview:
      '5.8.1 Action Verbs and Verbs-to-be；5.8.2 Subject-verb Agreement；5.8.3 Tenses：5.8.3.1 The Simple Present Tense，5.8.3.2 The Present Continuous Tense，5.8.3.3 The Simple Past Tense，5.8.3.4 The Past Continuous Tense，5.8.3.5 The Simple Future Tense，5.8.3.6 The Future Continuous Tense，5.8.3.7 The Present Perfect Tense，5.8.3.8 The Past Perfect Tense，5.8.3.9 The Present Perfect Continuous Tense，5.8.3.10 Active and Passive Voice',
  },
  '5.10 Grammar - The Participles': {
    preview: '5.10.1 Present Participles；5.10.2 Past Participles',
  },
  '5.18 Grammar - Phrases and Clauses': {
    preview: '5.18.1 Noun；5.18.2 Adjectival；5.18.3 Adverbial',
  },
  '5.19 Grammar - Sentence Types': {
    preview:
      '5.19.1 Simple Sentences；5.19.2 Compound Sentences；5.19.3 Complex Sentences',
  },
}

const MATH_CHAPTER_PREVIEW_NOTES: Record<
  string,
  { preview?: string; supplement?: string }
> = {
  '1.1 算术 - 整数': {
    preview:
      '1.1.1 理解整数的概念；1.1.2 理解绝对值的概念；1.1.3 进行整数的加、减、乘、除与乘方的运算及解应用题',
  },
  '1.2 算术 - 自然数': {
    preview:
      '1.2.1 理解奇数与偶数、质数与合数、因数与倍数及质因数的概念；1.2.2 进行因数分解；1.2.3 求最大公因数（H.C.F.）、最小公倍数（L.C.M.）及解应用题',
  },
  '1.3 算术 - 分数': {
    preview:
      '1.3.1 理解分数的概念与基本性质；1.3.2 了解分数的种类及比较分数的大小；1.3.3 进行分数的四则运算及解应用题',
  },
  '1.4 算术 - 小数': {
    preview:
      '1.4.1 理解小数的表示法及进行小数与分数的互化；1.4.2 进行小数的四则运算及解应用题；1.4.3 化分数为循环小数；1.4.4 理解有效数字与科学记数法及求近似值',
  },
  '1.5 算术 - 百分数': {
    preview:
      '1.5.1 进行百分数与小数、分数的互化及解应用题；1.5.2 掌握倍率、减率、折扣、盈亏、单利息及佣金的计算',
  },
  '1.6 算术 - 比与比例': {
    preview:
      '1.6.1 理解比与比例的概念及性质；1.6.2 进行连比的运算；1.6.3 掌握正比例、反比例、比例分配及解应用题',
  },
  '1.7 算术 - 记数制度': {
    preview:
      '1.7.1 理解二进制与八进制的概念；1.7.2 进行十进数与二进数、八进数与二进数的互化；1.7.3 进行二进数的四则运算',
  },
  '1.8 算术 - 度量衡基本单位': {
    preview:
      '1.8.1 进行长度的单位换算及解应用题；1.8.2 进行质量的单位换算及解应用题；1.8.3 进行容量的单位换算及解应用题；1.8.4 进行时间的单位换算及解应用题',
  },
  '2.1 代数 - 代数式': {
    preview: '2.1.1 理解代数式及计算代数式的值；2.1.2 掌握代数式的运算',
  },
  '2.2 代数 - 平方根与立方根': {
    preview: '2.2.1 计算平方根与立方根；2.2.2 进行二次根式的化简及四则运算',
  },
  '2.3 代数 - 多项式': {
    preview:
      '2.3.1 理解多项式的项、系数、常数项及次数；2.3.2 进行多项式的四则运算；2.3.3 掌握乘法公式',
  },
  '2.4 代数 - 因式分解': {
    preview:
      '2.4.1 进行多项式的因式分解；2.4.2 求多项式的最高公因式（H.C.F.）与最低公倍式（L.C.M.）',
  },
  '2.5 代数 - 方程式': {
    preview:
      '2.5.1 解一元一次方程式及应用题；2.5.2 解二元一次方程组及应用题；2.5.3 解一元二次方程式及应用题',
  },
  '2.6 代数 - 直角坐标系与图像': {
    preview:
      '2.6.1 理解直角坐标系；2.6.2 掌握中点公式；2.6.3 理解二元一次方程式的图像；2.6.4 掌握二元一次方程组的图解法；2.6.5 描绘一元二次函数的图像及掌握其性质',
  },
  '2.7 代数 - 分式': {
    preview:
      '2.7.1 理解分式的概念与基本性质；2.7.2 进行分式的四则运算；2.7.3 解分式方程式及应用题',
  },
  '2.8 代数 - 公式': {
    preview: '2.8.1 进行公式主项的更换及解应用题',
  },
  '2.9 代数 - 不等式': {
    preview:
      '2.9.1 理解不等式的基本性质；2.9.2 解一元一次不等式及应用题；2.9.3 解一元一次不等式组',
  },
  '2.10 代数 - 变数法': {
    preview: '2.10.1 解正变、反变及联变的相关问题',
  },
  '2.11 代数 - 指数与对数': {
    preview:
      '2.11.1 理解整数指数幂及分数指数幂的定义；2.11.2 掌握指数的运算法则；2.11.3 解何指数方程式；2.11.4 理解对数的定义及性质',
  },
  '3.1 几何 - 几何的基本概念': {
    preview:
      '3.1.1 理解线对称与点对称；3.1.2 理解分角、锐角、直角、钝角、平角、优角及周角的定义；3.1.3 计算余角、补角、斜补角及其辅角；3.1.4 理解相交线、垂线与平行线的定义；3.1.5 理解对顶角、同位角、内错角、同旁内角的定义及应用其性质；3.1.6 掌握平行线的判定',
  },
  '3.2 几何 - 三角形': {
    preview:
      '3.2.1 理解三角形的分类与边角关系；3.2.2 理解三角形的角平分线、中线及垂线；3.2.3 应用三角形的内角和及外角与的角的关系；3.2.4 掌握全等三角形的判定及证明；3.2.5 掌握等腰三角形、等边三角形及直角三角形的性质',
  },
  '3.3 几何 - 四边形与多边形': {
    preview:
      '3.3.1 掌握各种四边形的性质与判定；3.3.2 掌握多边形的内角和与外角和的公式',
  },
  '3.4 几何 - 周长面积表面积体积': {
    preview:
      '3.4.1 计算正方形、长方形、三角形、平行四边形、梯形、菱形、风筝形及圆形的周长与面积；3.4.2 计算扇形的弧长与面积；3.4.3 掌握等高三角形的面积比；3.4.4 计算立方体、长方体、柱体、锥体及球体的表面积与体积；3.4.5 进行面积及体积的单位换算；3.4.6 理解立体图形的平面展开图；3.4.7 解周长、面积及体积的相关应用题',
  },
  '3.5 几何 - 轨迹': {
    preview: '3.5.1 理解轨迹的概念',
  },
  '3.6 几何 - 毕氏定理': {
    preview: '3.6.1 掌握毕氏定理及其逆定理；3.6.2 应用距离公式及解应用题',
  },
  '3.7 几何 - 相似形': {
    preview:
      '3.7.1 掌握相似形的性质；3.7.2 掌握相似三角形的判定及应用；3.7.3 掌握相似形的面积比',
  },
  '3.8 几何 - 圆': {
    preview:
      '3.8.1 掌握圆心角定理、圆周角定理及垂径定理；3.8.2 掌握圆内接四边形的相关定理；3.8.3 掌握切线的判定及性质；3.8.4 掌握切线长定理及弦切角定理',
  },
  '3.9 几何 - 几何变换': {
    preview:
      '3.9.1 掌握反射变换；3.9.2 掌握平移变换及用序偶表示平移；3.9.3 掌握旋转变换及求旋转中心与旋转角度；3.9.4 掌握放大变换及求放大中心与放大因数',
  },
  '3.10 几何 - 三角函数': {
    preview:
      '3.10.1 理解锐角的正弦、余弦与正切的定义及其值的变化规律；3.10.2 进行特殊角（30°、45°、60°）三角函数值的运算；3.10.3 掌握三角函数的应用',
  },
  '4.1 统计学 - 统计表与统计图': {
    preview:
      '4.1.1 理解统计表与统计图；4.1.2 绘制条形图与线形图及掌握其特点；4.1.3 编制频数分配表与累积频数分配表；4.1.4 绘制直方图、频数多边形与累积频数多边形；4.1.5 计算累积频数百分率',
  },
  '4.2 统计学 - 集中趋势与四分位数': {
    preview:
      '4.2.1 掌握平均数、中位数及众数的求法；4.2.2 掌握四分位数的求法',
  },
  '5.1 集合论 - 集合': {
    preview:
      '5.1.1 理解集合与元素的表示法及集合与元素之间的关系；5.1.2 理解空集、有限集及基数的概念；5.1.3 理解子集的定义及表示法；5.1.4 理解等集、相离集的概念；5.1.5 掌握联集、交集、差集、泛集与补集的定义及运算',
  },
  '5.2 集合论 - 集合论的应用': {
    preview:
      '5.2.1 掌握两个集合或三个集合联集的基数公式及其应用；5.2.2 掌握余集的基数公式及其应用；5.2.3 应用范恩图法解题',
  },
}

const SCIENCE_CHAPTER_PREVIEW_NOTES: Record<
  string,
  { preview?: string; supplement?: string }
> = {
  '1.1 走入科学世界 - 科学探究': { preview: '1.1.1' },
  '1.2 走入科学世界 - 科学实验室': { preview: '1.2.1 ~ 1.2.5' },
  '1.3 走入科学世界 - 单位与测量': { preview: '1.3.1 ~ 1.3.2' },
  '2.1 生命科学 - 生命的现象': { preview: '2.1.1 ~ 2.1.2' },
  '2.2 生命科学 - 生物体的组成': { preview: '2.2.1 ~ 2.2.7' },
  '2.3.1 生命科学 - 营养与健康': { preview: '2.3.1.1 ~ 2.3.1.5' },
  '2.3.2 生命科学 - 光合作用': { preview: '2.3.2.1 ~ 2.3.2.2' },
  '2.3.3 生命科学 - 消化和吸收': { preview: '2.3.3.1 ~ 2.3.3.4' },
  '2.3.4 生命科学 - 呼吸': { preview: '2.3.4.1 ~ 2.3.4.9' },
  '2.3.5 生命科学 - 物质的运输': { preview: '2.3.5.1 ~ 2.3.5.7' },
  '2.3.6 生命科学 - 协调与恒定': { preview: '2.3.6.1 ~ 2.3.6.21' },
  '2.3.7 生命科学 - 生殖与发育': { preview: '2.3.7.1 ~ 2.3.7.16' },
  '2.3.8 生命科学 - 遗传与演化': { preview: '2.3.8.1 ~ 2.3.8.8' },
  '2.4 生命科学 - 生物与环境—生态系统': { preview: '2.4.1 ~ 2.4.10' },
  '2.5 生命科学 - 生物的多样性': { preview: '2.5.1 ~ 2.5.4' },
  '3.1 物质科学 - 物体与物质': { preview: '3.1.1 ~ 3.1.36' },
  '3.2 物质科学 - 质量守恒定律': { preview: '3.2.1' },
  '3.3.1 物质科学 - 能源与能量': { preview: '3.3.1.1 ~ 3.3.1.6' },
  '3.3.2 物质科学 - 热': { preview: '3.3.2.1 ~ 3.3.2.13' },
  '3.3.3 物质科学 - 波': { preview: '3.3.3.1 ~ 3.3.3.13' },
  '3.3.4 物质科学 - 光与色': { preview: '3.3.4.1 ~ 3.3.4.14' },
  '3.3.5 物质科学 - 电与磁': { preview: '3.3.5.1 ~ 3.3.5.48' },
  '3.4 物质科学 - 力与运动': { preview: '3.4.1 ~ 3.4.28' },
  '4.1 地球、宇宙与空间科学 - 地球运动与效应': { preview: '4.1.1 ~ 4.1.4' },
  '4.2 地球、宇宙与空间科学 - 地球的概貌': { preview: '4.2.1 ~ 4.2.3' },
  '4.3.1 地球、宇宙与空间科学 - 土壤': { preview: '4.3.1.1 ~ 4.3.1.5' },
  '4.3.2 地球、宇宙与空间科学 - 岩石': { preview: '4.3.2.1' },
  '4.3.3 地球、宇宙与空间科学 - 矿物': { preview: '4.3.3.1 ~ 4.3.3.14' },
  '4.3.4 地球、宇宙与空间科学 - 水': { preview: '4.3.4.1 ~ 4.3.4.37' },
  '4.3.5 地球、宇宙与空间科学 - 大气': { preview: '4.3.5.1 ~ 4.3.5.26' },
  '4.3.6 地球、宇宙与空间科学 - 生物': { preview: '4.3.6.1 ~ 4.3.6.2' },
  '4.4.1 地球、宇宙与空间科学 - 太阳系': { preview: '4.4.1.1 ~ 4.4.1.3' },
  '4.4.2 地球、宇宙与空间科学 - 星与星系': { preview: '4.4.2.1 ~ 4.4.2.4' },
  '4.4.3 地球、宇宙与空间科学 - 宇宙': { preview: '4.4.3.1 ~ 4.4.3.2' },
  '4.4.4 地球、宇宙与空间科学 - 天文与太空探索的发展': {
    preview: '4.4.4.1 ~ 4.4.4.2',
  },
}

const HISTORY_CHAPTER_PREVIEW_NOTES: Record<
  string,
  { preview?: string; supplement?: string }
> = {
  '1.1.1 马来西亚史部分 - 马六甲王国的建国经过': { preview: '1.1.1.1 ~ 1.1.1.2' },
  '1.1.2 马来西亚史部分 - 葡萄牙与荷兰对马六甲的殖民统治': {
    preview: '1.1.2.1 ~ 1.1.2.2',
  },
  '1.1.3 马来西亚史部分 - 柔佛王国的兴衰（含三角战争）': {
    preview: '1.1.3.1 ~ 1.1.3.3',
  },
  '1.1.4 马来西亚史部分 - 马来社会与文化': {
    preview: '1.1.4.1 ~ 1.1.4.3',
  },
  '1.2.1 马来西亚史部分 - 海峡殖民地的组成': {
    preview: '1.2.1.1 ~ 1.2.1.4',
  },
  '1.2.2 马来西亚史部分 - 英国干涉马来土邦的经过': {
    preview: '1.2.2.1 ~ 1.2.2.9',
  },
  '1.3.1 马来西亚史部分 - 马来属邦': {
    preview: '1.3.1.1 ~ 1.3.1.4',
  },
  '1.3.2 马来西亚史部分 - 英国在北婆罗洲的扩张': {
    preview: '1.3.2.1 ~ 1.3.2.4',
  },
  '1.3.3 马来西亚史部分 - 我国反殖民统治的行动': {
    preview: '1.3.3.1 ~ 1.3.3.2',
  },
  '1.4.1 马来西亚史部分 - 英殖民统治下的经济、社会、教育与文化发展概况': {
    preview: '1.4.1.1 ~ 1.4.1.3',
  },
  '1.5.1 马来西亚史部分 - 日本入侵我国的经过、统治政策以及人民展开的抗日斗争': {
    preview: '1.5.1.1 ~ 1.5.1.3',
  },
  '1.6.1 马来西亚史部分 - 婆罗洲战争与砂捞越会谈': {
    preview: '1.6.1.1 ~ 1.6.1.2',
  },
  '1.6.2 马来西亚史部分 - 马来亚联邦和马来亚联合邦': {
    preview: '1.6.2.1 ~ 1.6.2.3',
  },
  '1.7.1 马来西亚史部分 - 马来亚独立的经过': {
    preview: '1.7.1.1 ~ 1.7.1.2',
  },
  '1.7.2 马来西亚史部分 - 五一三事件及其后续发展': {
    preview: '1.7.2.1',
  },
  '1.7.3 马来西亚史部分 - 新经济政策': {
    preview: '1.7.3.1',
  },
  '1.7.4 马来西亚史部分 - 我国教育政策与华教发展': {
    preview: '1.7.4.1 ~ 1.7.4.2',
  },
  '1.7.5 马来西亚史部分 - 我国积极参与的国际性组织——东盟': {
    preview: '1.7.5.1',
  },
  '2.1.1 世界史部分 - 历史的概念': { preview: '2.1.1.1' },
  '2.1.2 世界史部分 - 世界四大古文明': { preview: '2.1.2.1' },
  '2.1.3 世界史部分 - 世界三大宗教': { preview: '2.1.3.1 ~ 2.1.3.2' },
  '2.2.1 中国古代史 - 中国各朝代的顺序': { preview: '2.2.1.1 ~ 2.2.1.2' },
  '2.2.2 中国古代史 - 周朝的封建制度和宗法制度': {
    preview: '2.2.2.1 ~ 2.2.2.2',
  },
  '2.2.3 中国古代史 - 秦始皇的功绩': { preview: '2.2.3.1' },
  '2.2.4 中国古代史 - 汉武帝的政绩与丝绸之路': { preview: '2.2.4.1 ~ 2.2.4.2' },
  '2.2.5 中国古代史 - 魏晋南北朝的民族融合': { preview: '2.2.5.1' },
  '2.2.6 中国古代史 - 隋朝的重要建设': { preview: '2.2.6.1' },
  '2.2.7 中国古代史 - 唐太宗的政绩与东来的唐化运动': {
    preview: '2.2.7.1 ~ 2.2.7.2',
  },
  '2.2.8 中国古代史 - 宋朝的政治发展': { preview: '2.2.8.1' },
  '2.2.9 中国古代史 - 元朝兴亡': { preview: '2.2.9.1' },
  '2.2.10 中国古代史 - 明朝专制与郑和下西洋': {
    preview: '2.2.10.1 ~ 2.2.10.2',
  },
  '2.2.11 中国古代史 - 清朝前期的盛世': { preview: '2.2.11.1' },
  '2.2.12 中国古代史 - 中国文化之代表及特色': {
    preview: '2.2.12.1 ~ 2.2.12.4',
  },
  '2.3.1 中国近现代史 - 鸦片战争': { preview: '2.3.1.1' },
  '2.3.2 中国近现代史 - 洋务运动与变法维新': {
    preview: '2.3.2.1 ~ 2.3.2.4',
  },
  '2.3.3 中国近现代史 - 辛亥革命与中华民国的建立': {
    preview: '2.3.3.1',
  },
  '2.3.4 中国近现代史 - 东南沿海人民移居海外': {
    preview: '2.3.4.1',
  },
  '2.3.5 中国近现代史 - 新文化运动与五四运动': {
    preview: '2.3.5.1 ~ 2.3.5.2',
  },
  '2.3.6 中国近现代史 - 中华人民共和国的发展': {
    preview: '2.3.6.1',
  },
  '2.4.1 南亚及东南亚史 - 东南亚各国沦为殖民地': {
    preview: '2.4.1.1',
  },
  '2.4.2 南亚及东南亚史 - 东南亚各国的独立与发展': {
    preview: '2.4.2.1 ~ 2.4.2.4',
  },
  '2.4.3 南亚及东南亚史 - 暹罗的不同发展': {
    preview: '2.4.3.1 ~ 2.4.3.3',
  },
  '2.4.4 南亚及东南亚史 - 印度甘地的不合作运动及其独立经过': {
    preview: '2.4.4.1 ~ 2.4.4.2',
  },
  '2.5.1 欧洲古代史 - 古希腊城邦政治': { preview: '2.5.1.1' },
  '2.5.2 欧洲古代史 - 罗马帝国的兴衰及其法律制度': {
    preview: '2.5.2.1',
  },
  '2.5.3 欧洲古代史 - 中古欧洲的政治、经济和社会特色': {
    preview: '2.5.3.1',
  },
  '2.5.4 欧洲古代史 - 近代欧洲的兴起': { preview: '2.5.4.1 ~ 2.5.4.4' },
  '2.5.5 欧洲古代史 - 欧洲的文化演进特色': {
    preview: '2.5.5.1 ~ 2.5.5.2',
  },
  '2.6.1 欧洲近现代史 - 英国君主立宪制的确立及责任内阁制': {
    preview: '2.6.1.1 ~ 2.6.1.2',
  },
  '2.6.2 欧洲近现代史 - 启蒙运动': { preview: '2.6.2.1' },
  '2.6.3 欧洲近现代史 - 美国独立战争': { preview: '2.6.3.1 ~ 2.6.3.2' },
  '2.6.4 欧洲近现代史 - 法国大革命': { preview: '2.6.4.1 ~ 2.6.4.2' },
  '2.6.5 欧洲近现代史 - 拿破仑称霸欧洲': { preview: '2.6.5.1' },
  '2.6.6 欧洲近现代史 - 工业革命': { preview: '2.6.6.1 ~ 2.6.6.2' },
  '2.6.7 欧洲近现代史 - 第一次世界大战': { preview: '2.6.7.1 ~ 2.6.7.2' },
  '2.6.8 欧洲近现代史 - 苏联的崛起': { preview: '2.6.8.1 ~ 2.6.8.2' },
  '2.6.9 欧洲近现代史 - 第二次世界大战之背景、经过及影响': {
    preview: '2.6.9.1',
  },
  '2.6.10 欧洲近现代史 - 重要国际组织——联合国及欧盟': {
    preview: '2.6.10.1 ~ 2.6.10.2',
  },
  '2.6.11 欧洲近现代史 - 冷战': { preview: '2.6.11.1' },
}

const GEOGRAPHY_CHAPTER_PREVIEW_NOTES: Record<
  string,
  { preview?: string; supplement?: string }
> = {
  '1.1 读图解图 - 平面图与地图': { preview: '1.1.1 ~ 1.1.6' },
  '1.2 读图解图 - 地图的判读': { preview: '1.2.1 ~ 1.2.8' },
  '2.1 地理资料的收集与处理 - 地理资料的收集': {
    preview: '2.1.1 ~ 2.1.2',
  },
  '2.2 地理资料的收集与处理 - 统计图': { preview: '2.2.1' },
  '3.1 马来西亚地理 - 地理位置': { preview: '3.1.1 ~ 3.1.3' },
  '3.2 马来西亚地理 - 地形': { preview: '3.2.1 ~ 3.2.2' },
  '3.3 马来西亚地理 - 气候': { preview: '3.3.1 ~ 3.3.6' },
  '3.4 马来西亚地理 - 河流': { preview: '3.4.1 ~ 3.4.2' },
  '3.5 马来西亚地理 - 森林': { preview: '3.5.1 ~ 3.5.4' },
  '3.6 马来西亚地理 - 人类活动与自然环境的关系': {
    preview: '3.6.1 ~ 3.6.3',
  },
  '3.7 马来西亚地理 - 人口': { preview: '3.7.1 ~ 3.7.7' },
  '3.8 马来西亚地理 - 聚落': { preview: '3.8.1 ~ 3.8.6' },
  '3.9 马来西亚地理 - 交通': { preview: '3.9.1 ~ 3.9.7' },
  '3.10 马来西亚地理 - 农业': { preview: '3.10.1 ~ 3.10.3' },
  '3.11 马来西亚地理 - 渔业': { preview: '3.11.1 ~ 3.11.6' },
  '3.12 马来西亚地理 - 矿业': { preview: '3.12.1 ~ 3.12.3' },
  '3.13 马来西亚地理 - 能源': { preview: '3.13.1 ~ 3.13.3' },
  '3.14 马来西亚地理 - 工业': { preview: '3.14.1 ~ 3.14.5' },
  '3.15 马来西亚地理 - 服务业': { preview: '3.15.1 ~ 3.15.4' },
  '3.16 马来西亚地理 - 经济活动': { preview: '3.16.1 ~ 3.16.4' },
  '4.1 自然地理 - 地球': { preview: '4.1.1 ~ 4.1.5' },
  '4.2 自然地理 - 陆地与海洋': { preview: '4.2.1 ~ 4.2.5' },
  '4.3 自然地理 - 板块运动': { preview: '4.3.1 ~ 4.3.5' },
  '4.4 自然地理 - 地震': { preview: '4.4.1 ~ 4.4.7' },
  '4.5 自然地理 - 火山': { preview: '4.5.1 ~ 4.5.6' },
  '4.6 自然地理 - 河流地形与海岸地形': { preview: '4.6.1 ~ 4.6.6' },
  '4.7 自然地理 - 石灰岩地形、干旱地形、平原地形': {
    preview: '4.7.1 ~ 4.7.2',
  },
  '4.8 自然地理 - 冰河地形': { preview: '4.8.1' },
  '4.9 自然地理 - 地形的开发与利用': { preview: '4.9.1 ~ 4.9.2' },
  '4.10 自然地理 - 气候': { preview: '4.10.1 ~ 4.10.5' },
  '4.11 自然地理 - 自然景观': { preview: '4.11.1 ~ 4.11.2' },
  '5.1 人文地理 - 自然资源': { preview: '5.1.1' },
  '5.2 人文地理 - 土地资源': { preview: '5.2.1 ~ 5.2.5' },
  '5.3 人文地理 - 森林资源': { preview: '5.3.1 ~ 5.3.2' },
  '5.4 人文地理 - 水资源': { preview: '5.4.1 ~ 5.4.3' },
  '5.5 人文地理 - 矿产资源': { preview: '5.5.1 ~ 5.5.5' },
  '5.6 人文地理 - 能源': { preview: '5.6.1 ~ 5.6.5' },
  '5.7 人文地理 - 国家、世界文化与国际组织': {
    preview: '5.7.1 ~ 5.7.4',
  },
  '5.8 人文地理 - 世界人口': { preview: '5.8.1 ~ 5.8.5' },
  '5.9 人文地理 - 城市化': { preview: '5.9.1 ~ 5.9.4' },
  '5.10 人文地理 - 世界交通、资讯、贸易与全球化': {
    preview: '5.10.1 ~ 5.10.6',
  },
  '6.1 全球议题 - 自然景观带的开发与环境问题': {
    preview: '6.1.1 ~ 6.1.2',
  },
  '6.2 全球议题 - 全球暖化': { preview: '6.2.1 ~ 6.2.3' },
  '6.3 全球议题 - 河水泛滥': { preview: '6.3.1 ~ 6.3.2' },
  '6.4 全球议题 - 荒漠化': { preview: '6.4.1 ~ 6.4.2' },
  '6.5 全球议题 - 饥荒': { preview: '6.5.1 ~ 6.5.2' },
}

export const PracticeCenterScreen: React.FC<PracticeCenterScreenProps> = ({
  t,
  initialSubjectId,
}) => {
  const { lang } = useApp()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([])
  const [loadedSubjectId, setLoadedSubjectId] = useState<string>('')
  const [subjectData, setSubjectData] = useState<PracticeSubjectData>(
    createEmptySubjectData
  )
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true)
  const [isSubjectDataLoading, setIsSubjectDataLoading] = useState(false)
  const [subjectDataError, setSubjectDataError] = useState<string | null>(null)
  const [isSubjectBarPinned, setIsSubjectBarPinned] = useState(false)
  const [previewConfig, setPreviewConfig] =
    useState<PracticeModePreviewConfig | null>(null)
  const subjectSentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function fetchPracticeBootstrap() {
      setIsBootstrapLoading(true)
      setSubjectDataError(null)
      try {
        const response = await fetchWithTimeout('/api/practice/bootstrap', {
          timeoutMs: 8000,
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Bootstrap request failed: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid bootstrap response')
        }

        if (cancelled) return

        const subjects = Array.isArray(result.data.subjects)
          ? (result.data.subjects as DbSubject[])
          : []
        const normalizedSubjects = normalizeClientSubjects(subjects)
        const defaultSubjectId =
          typeof result.data.defaultSubjectId === 'string'
            ? result.data.defaultSubjectId
            : ''
        const safeDefaultSubjectId = normalizedSubjects[0]?.id || ''
        const requestedSubjectId =
          typeof initialSubjectId === 'string' &&
          normalizedSubjects.some((subject) => subject.id === initialSubjectId)
            ? initialSubjectId
            : ''
        const nextSelectedSubjectId = requestedSubjectId || safeDefaultSubjectId
        const bootstrapSubjectData = result.data
          .subjectData as PracticeSubjectData | null

        setDbSubjects(normalizedSubjects)
        setSelectedSubjectId(nextSelectedSubjectId)
        if (
          nextSelectedSubjectId &&
          bootstrapSubjectData &&
          nextSelectedSubjectId === defaultSubjectId
        ) {
          setSubjectData(bootstrapSubjectData)
          setLoadedSubjectId(nextSelectedSubjectId)
        } else {
          setSubjectData(createEmptySubjectData())
          setLoadedSubjectId('')
        }
      } catch (error) {
        if (cancelled) return
        console.error('Failed to fetch practice bootstrap:', error)
        setDbSubjects([])
        setSelectedSubjectId('')
        setLoadedSubjectId('')
        setSubjectData(createEmptySubjectData())
        setSubjectDataError(
          isAbortLikeError(error)
            ? '请求超时，请稍后重试'
            : '加载练习中心数据失败'
        )
      } finally {
        if (!cancelled) {
          setIsBootstrapLoading(false)
        }
      }
    }

    fetchPracticeBootstrap()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [initialSubjectId])

  useEffect(() => {
    if (!selectedSubjectId) {
      setSubjectData(createEmptySubjectData())
      setLoadedSubjectId('')
      return
    }

    if (selectedSubjectId === loadedSubjectId) {
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchSubjectData() {
      setIsSubjectDataLoading(true)
      setSubjectDataError(null)
      setSubjectData(createEmptySubjectData())
      try {
        const response = await fetchWithTimeout(
          `/api/practice/subject-data?subjectId=${encodeURIComponent(selectedSubjectId)}`,
          {
            timeoutMs: 8000,
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error(`Subject data request failed: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid subject data response')
        }

        if (cancelled) {
          return
        }

        setSubjectData(result.data as PracticeSubjectData)
        setLoadedSubjectId(selectedSubjectId)
      } catch (error) {
        if (cancelled) return
        console.error('Failed to fetch subject data:', error)
        setSubjectData(createEmptySubjectData())
        setSubjectDataError(
          isAbortLikeError(error) ? '请求超时，请稍后重试' : '加载科目数据失败'
        )
      } finally {
        if (!cancelled) {
          setIsSubjectDataLoading(false)
        }
      }
    }

    fetchSubjectData()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [selectedSubjectId, loadedSubjectId])

  useEffect(() => {
    const sentinel = subjectSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSubjectBarPinned(!entry.isIntersecting)
      },
      {
        threshold: 1,
        rootMargin: '-8px 0px 0px 0px',
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const currentDbSubject = dbSubjects.find((s) => s.id === selectedSubjectId)
  const currentSubjectTitle = currentDbSubject
    ? getSubjectLabel(
        currentDbSubject.key ||
          resolveSubjectKeyFromName(currentDbSubject.name),
        lang,
        currentDbSubject.name
      )
    : 'Practice Center'
  const isLoadingSubjectData = isBootstrapLoading || isSubjectDataLoading
  const weakChapters = useMemo(
    () =>
      subjectData.chapters.filter(
        (chapter) =>
          chapter.stats.totalAttempts >= 3 && chapter.stats.masteryLevel < 70
      ),
    [subjectData.chapters]
  )
  const strongestSignal = weakChapters[0]
    ? lang === 'zh'
      ? `最近最需要收口：${weakChapters[0].title}`
      : lang === 'ms'
        ? `Fokus semasa: ${weakChapters[0].title}`
        : `Current recovery focus: ${weakChapters[0].title}`
    : lang === 'zh'
      ? '先做首轮训练建立掌握基线'
      : lang === 'ms'
        ? 'Mulakan satu pusingan untuk bina garis asas'
        : 'Start one round to build a baseline'

  const openSmartDrillPreview = () => {
    if (!selectedSubjectId) return
    const estimatedMinutes = Math.max(
      8,
      Math.min(16, 6 + weakChapters.length * 2)
    )
    const estimatedQuestions = weakChapters.length > 0 ? 10 : 8

    setPreviewConfig({
      mode: 'SMART_DRILL',
      title: '先看这一轮 Smart Drill 预览',
      subtitle: `${currentSubjectTitle} 的默认主训练路径`,
      description: '系统会先排一组短轮高价值题，再进入统一答题页连续作答。',
      primaryStatLabel: '预计题量',
      primaryStatValue: `${estimatedQuestions} 题`,
      secondaryStatLabel: '预计时间',
      secondaryStatValue: `${estimatedMinutes} 分钟`,
      tertiaryStatLabel: '当前重点',
      tertiaryStatValue:
        weakChapters.length > 0
          ? `${weakChapters.length} 个薄弱点待收口`
          : '建立首轮基线',
      reasons: [
        strongestSignal,
        subjectData.chapters.length > 0
          ? '会优先覆盖当前波动更大的章节。'
          : '当前会先用一轮通用题建立基线表现。',
        '进入后题目会完整铺开，一次性做完整轮再统一交卷。',
      ],
      details: [
        { label: '答题布局', value: '左答题卡 / 中题目 / 右状态栏' },
        { label: '反馈方式', value: '整组连续作答，一次性交卷' },
        { label: '结果页', value: '统一复盘摘要' },
      ],
      startHref: `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始这一轮 Smart Drill',
    })
  }

  const openErrorWiperPreview = () => {
    if (!selectedSubjectId) return

    setPreviewConfig({
      mode: 'ERROR_WIPER',
      title: '先看这一轮 Error Wiper 预览',
      subtitle: '集中修复最近不稳定的错题',
      description:
        '进入后会直接打开统一答题页，把本轮错题整组做完后再统一提交。',
      primaryStatLabel: '预计错题数',
      primaryStatValue: `${Math.max(6, weakChapters.length * 2 || 8)} 题`,
      secondaryStatLabel: '预计时间',
      secondaryStatValue: `${Math.max(8, weakChapters.length + 6)} 分钟`,
      tertiaryStatLabel: '修复目标',
      tertiaryStatValue:
        weakChapters.length > 0 ? '优先回收近期失分点' : '建立首轮错题修复记录',
      reasons: [
        '会优先拉取最近做错、掌握仍不稳定的题目。',
        '更适合在 Smart Drill 后做针对性修复，而不是第一次接触新题。',
        '统一交卷后会告诉你本轮修复了多少、还剩哪些遗留点。',
      ],
      details: [
        { label: '答题布局', value: '统一三栏作答页' },
        { label: '提交节奏', value: '整组完成后一次性交卷' },
        { label: '结果页', value: '修复数量 + 剩余风险点' },
      ],
      startHref: `/dashboard/practice/error-wiper?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始 Error Wiper',
    })
  }

  const openMockArenaPreview = () => {
    if (!selectedSubjectId) return

    setPreviewConfig({
      mode: 'MOCK_ARENA',
      title: '先看这一场 Mock Arena 预览',
      subtitle: `${currentSubjectTitle} 模拟考试`,
      description:
        '会用默认配置直接生成一套卷，进入统一答题页后整卷完成再提交。',
      primaryStatLabel: '题量',
      primaryStatValue: '20 题',
      secondaryStatLabel: '时间',
      secondaryStatValue: '30 分钟',
      tertiaryStatLabel: '难度',
      tertiaryStatValue: '标准 MEDIUM',
      reasons: [
        '更适合在日常训练之后检查真实考试节奏和时间分配。',
        '作答时不会展示答案，保持更接近正式考试的状态。',
        '提交后会统一给出得分、正确率和整卷表现。',
      ],
      details: [
        { label: '答题布局', value: '统一三栏作答页' },
        { label: '右侧面板', value: '剩余时间 + 已答题数 + 交卷' },
        { label: '进入方式', value: '直接生成试卷并开始' },
      ],
      startHref: `/dashboard/practice/mock-arena?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始 Mock Arena',
    })
  }

  const openChapterPreview = (
    chapter: (typeof subjectData.chapters)[number]
  ) => {
    const parsedTitle = parseStructuredChapterTitle(chapter.title)
    const currentSubjectKey =
      currentDbSubject?.key || resolveSubjectKeyFromName(currentDbSubject?.name)
    const chapterPreviewNote =
      currentSubjectKey === 'chinese'
        ? CHINESE_CHAPTER_PREVIEW_NOTES[chapter.title]
        : currentSubjectKey === 'english'
          ? ENGLISH_CHAPTER_PREVIEW_NOTES[chapter.title]
          : currentSubjectKey === 'math'
            ? MATH_CHAPTER_PREVIEW_NOTES[chapter.title]
            : currentSubjectKey === 'science'
              ? SCIENCE_CHAPTER_PREVIEW_NOTES[chapter.title]
              : currentSubjectKey === 'history'
                ? HISTORY_CHAPTER_PREVIEW_NOTES[chapter.title]
                : currentSubjectKey === 'geography'
                  ? GEOGRAPHY_CHAPTER_PREVIEW_NOTES[chapter.title]
          : undefined
    const previewTitle = parsedTitle
      ? `${parsedTitle.code} ${parsedTitle.primaryTitle}`
      : chapter.title
    const focusTitle = parsedTitle?.secondaryTitle || '当前章节重点'

    setPreviewConfig({
      mode: 'CHAPTER_MAP',
      title: `先看「${previewTitle}」章节预览`,
      subtitle: `${currentSubjectTitle} 章节定向练习`,
      description:
        chapterPreviewNote?.preview || chapterPreviewNote?.supplement
          ? `进入后会围绕「${focusTitle}」加载当前章节练习，并使用统一答题页整组完成。`
          : '进入后会加载当前章节的一组练习题，并使用统一答题页整组完成。',
      primaryStatLabel: '章节掌握度',
      primaryStatValue: `${chapter.stats.masteryLevel}%`,
      secondaryStatLabel: '题量',
      secondaryStatValue: `${Math.max(chapter.stats.questionCount || 10, 10)} 题`,
      tertiaryStatLabel: '练习目标',
      tertiaryStatValue:
        chapter.stats.masteryLevel < 70 ? '优先补弱' : '稳定巩固',
      reasons: [
        `当前章节最近正确率 ${chapter.stats.recentCorrectRate ?? chapter.stats.masteryLevel}% 。`,
        chapter.stats.masteryLevel < 70
          ? '这一章还不稳，适合先集中补这一块。'
          : '这章已经有基础，更适合拿来稳住速度和准确率。',
        '进入后会直接打开统一答题页，不再切成多种练习界面。',
      ],
      details: [
        { label: '章节焦点', value: focusTitle },
        ...(chapterPreviewNote?.supplement
          ? [{ label: '补充说明', value: chapterPreviewNote.supplement }]
          : []),
        ...(chapterPreviewNote?.preview
          ? [{ label: 'Preview', value: chapterPreviewNote.preview }]
          : []),
        { label: '题目来源', value: '当前章节随机抽题' },
        { label: '答题方式', value: '整组连续作答' },
        { label: '提交结果', value: '章节正确率 + 复盘摘要' },
      ],
      startHref: `/dashboard/practice/chapter-drill/${chapter.id}?autostart=1`,
      startLabel: '开始章节练习',
    })
  }

  const openPastPaperPreview = (
    paper: (typeof subjectData.pastPapers)[number]
  ) => {
    setPreviewConfig({
      mode: 'PAST_PAPER',
      title: `先看「${paper.title}」真题预览`,
      subtitle: paper.sourceYear
        ? `${paper.sourceYear} · ${paper.sourcePaper || '历年真题'}`
        : '历年真题',
      description: '进入后会直接打开统一答题页，整套题一次性完成再交卷。',
      primaryStatLabel: '题量',
      primaryStatValue: `${paper.questionCount} 题`,
      secondaryStatLabel: '来源',
      secondaryStatValue: paper.sourcePaper || '题库归档',
      tertiaryStatLabel: '年份',
      tertiaryStatValue: paper.sourceYear ? `${paper.sourceYear}` : '未标注',
      reasons: [
        '更适合在章节训练之后做整套实战，检查综合表现。',
        '会保留真实卷感，但答题页与其他模式保持统一，减少切换成本。',
        '提交后会统一查看整卷结果和薄弱题分布。',
      ],
      details: [
        { label: '答题布局', value: '统一三栏作答页' },
        { label: '提交方式', value: '整卷完成后一次性交卷' },
        { label: '结果页', value: '整卷得分 + 错题分布' },
      ],
      startHref: `/dashboard/practice/past-paper/${paper.id}?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始这套真题',
    })
  }

  const headerCopy = {
    zh: {
      title: '练习中心',
      subtitle:
        '先从三种主要练习模式里选一个开始，再往下查看章节地图、历年真题和分析结果。',
      noSubjectsTitle: '当前还没有可用科目',
      noSubjectsSubtitle:
        '等科目数据接入后，这里会显示完整的训练入口和分析面板。',
      subjectLabel: '选择科目',
    },
    en: {
      title: 'Practice Center',
      subtitle:
        'Start with one of the three core modes, then move into chapter practice, past papers, and analytics.',
      noSubjectsTitle: 'No subjects available yet',
      noSubjectsSubtitle:
        'Once subject data is connected, the full training entry points and analytics will appear here.',
      subjectLabel: 'Select Subject',
    },
    ms: {
      title: 'Pusat Latihan',
      subtitle:
        'Mulakan dengan salah satu daripada tiga mod utama, kemudian turun ke peta bab, kertas tahun lepas dan analitik.',
      noSubjectsTitle: 'Tiada subjek tersedia lagi',
      noSubjectsSubtitle:
        'Apabila data subjek disambungkan, pintu masuk latihan dan panel analitik penuh akan muncul di sini.',
      subjectLabel: 'Pilih Subjek',
    },
  }[lang]

  return (
    <div className="relative px-3 py-1.5 sm:px-4 sm:py-2">
      <PracticeModePreviewDialog
        open={Boolean(previewConfig)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewConfig(null)
          }
        }}
        config={previewConfig}
      />

      <div
        className={`mx-auto w-full max-w-[1820px] ${pageShellFrameClass} ${pageSectionGapClass} sm:p-2.5`}
      >
        <PageHeroShell
          className={`${pageHeroShellClass} bg-surface bg-none shadow-none`}
          title={
            <PageHeroTitle title={headerCopy.title} capsuleLabel="Practice" />
          }
          subtitle={headerCopy.subtitle}
          titleClassName="font-semibold"
        />

        <div ref={subjectSentinelRef} className="h-px" />
        <div
          className={`sticky top-2.5 z-30 transition-all duration-300 ease-out ${
            isSubjectBarPinned
              ? 'rounded-[22px] border border-borderTone bg-surface/95 px-3 py-2 shadow-surface-lg backdrop-blur-xl dark:border-borderTone dark:bg-surface/90 dark:shadow-[0_18px_40px_rgba(2,8,23,0.36)]'
              : 'border-transparent bg-transparent px-0 py-0'
          }`}
        >
          <div className={pageHeroEyebrowClass}>{headerCopy.subjectLabel}</div>
          <PracticeSubjectBar
            subjects={dbSubjects}
            selectedSubjectId={selectedSubjectId}
            onSelect={setSelectedSubjectId}
          />
        </div>

        <div className={`grid xl:grid-cols-3 ${pageGridGapClass}`}>
          <div className={`xl:col-span-2 ${pageSectionGapClass}`}>
            <div
              className={`${pagePanelClass} rounded-[26px] ${pageCardPaddingClass}`}
            >
              <PracticeModeGrid
                selectedSubjectId={selectedSubjectId}
                currentSubjectTitle={currentSubjectTitle}
                chapterCount={subjectData.chapters.length}
                pastPaperCount={subjectData.pastPapers.length}
                weakChapterCount={weakChapters.length}
                strongestSignal={strongestSignal}
                onOpenSmartDrillPreview={openSmartDrillPreview}
                onOpenErrorWiperPreview={openErrorWiperPreview}
                onOpenMockArenaPreview={openMockArenaPreview}
              />
            </div>

            <div className={`grid xl:grid-cols-2 ${pageGridGapClass}`}>
              <div
                className={`${pagePanelClass} rounded-[26px] ${pageCardPaddingClass}`}
              >
                <ChapterProgressSection
                  chapters={subjectData.chapters}
                  isLoading={isLoadingSubjectData}
                  onPreviewChapter={openChapterPreview}
                />
              </div>
              <div
                className={`${pagePanelClass} rounded-[26px] ${pageCardPaddingClass}`}
              >
                <PastPaperLibrarySection
                  selectedSubjectId={selectedSubjectId}
                  papers={subjectData.pastPapers}
                  isLoading={isLoadingSubjectData}
                  onPreviewPaper={openPastPaperPreview}
                />
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <PracticeCoachPanel
              selectedSubjectId={selectedSubjectId}
              currentSubjectTitle={currentSubjectTitle}
              chapters={subjectData.chapters}
              knowledgeHive={subjectData.knowledgeHive}
              examForecast={subjectData.examForecast}
              isLoading={isLoadingSubjectData}
              errorMessage={subjectDataError}
            />
          </div>
        </div>

        {!isBootstrapLoading && dbSubjects.length === 0 ? (
          <PageEmptyState
            title={headerCopy.noSubjectsTitle}
            description={headerCopy.noSubjectsSubtitle}
            className="rounded-[30px] p-8"
            titleClassName="text-xl font-black tracking-tight"
            descriptionClassName="text-sm leading-6"
          />
        ) : null}
      </div>
    </div>
  )
}

export { PracticeCenterScreen as QuestionBankView }
