import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/lib/prisma'
import type { CreateQuestionInput } from './types'

type ChapterCandidate = {
  id: string
  title: string
  shortTitle: string
  keywords: string[]
}

type QuestionSourceContext = {
  filename?: string | null
  sourceNote?: string | null
  fileUrl?: string | null
}

type ChapterTaggingInput = {
  id: string
  content: string
  explanation?: string | null
  options?: Record<string, string> | null
  answer?: unknown
  tags?: string[]
  subjectId?: string | null
  chapterId?: string | null
  source?: string | null
  sourceFileId?: string | null
  sourceFile?: QuestionSourceContext | null
}

export type ChapterTaggingStrategy = 'existing' | 'rule' | 'ai' | 'none'

export interface ChapterTaggingSuggestion {
  questionId: string
  chapterId: string | null
  strategy: ChapterTaggingStrategy
  confidence: number
  reason: string
}

const RULE_ASSIGN_SCORE = 5
const RULE_ASSIGN_MARGIN = 2.5
const MAX_AI_CANDIDATES = 8
const MAX_AI_BATCH_SIZE = 6
const FIELD_WEIGHTS = {
  content: 1,
  options: 0.9,
  answer: 1.15,
  explanation: 0.85,
  source: 1.1,
  tags: 0.45,
} as const
const FIELD_NAMES: Record<keyof typeof FIELD_WEIGHTS, string> = {
  content: '题干',
  options: '选项',
  answer: '答案',
  explanation: '解析',
  source: '来源',
  tags: '标签',
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
    .trim()
}

function cleanChapterTitle(title: string): string {
  const lastSegment = title.split(' - ').pop() || title
  return lastSegment.replace(/^\d+(?:\.\d+)*\s*/u, '').trim()
}

function addChapterKeywords(target: string[], ...values: Array<string | string[]>): void {
  for (const value of values) {
    if (Array.isArray(value)) {
      target.push(...value)
    } else {
      target.push(value)
    }
  }
}

function buildChapterKeywords(title: string): string[] {
  const cleaned = cleanChapterTitle(title)
  const isScienceBiosphereLeaf =
    /地球、宇宙与空间科学/u.test(title) && /^生物$/i.test(cleaned)
  const isHistoryConceptLeaf =
    /世界史部分/u.test(title) && /^历史的概念$/i.test(cleaned)
  const parts = cleaned
    .split(/[、，,；;：:（）()\s/]+/u)
    .flatMap((segment) => segment.split(/[与和及之的]/u))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 2)

  const extras: string[] = []

  if (/秦始皇|秦朝|秦国/u.test(cleaned)) {
    extras.push(
      '商鞅变法',
      '秦始皇',
      '统一六国',
      '郡县制',
      '书同文',
      '车同轨',
      '度量衡',
      '长城',
      '灵渠',
      '大泽乡',
      '战国七雄',
      '长平之战'
    )
  }

  if (/汉武帝|丝绸之路|汉朝|西汉|东汉/u.test(cleaned)) {
    extras.push(
      '汉武帝',
      '张骞',
      '西域',
      '匈奴',
      '卫青',
      '霍去病',
      '推恩令',
      '罢黜百家',
      '大一统',
      '丝绸之路',
      '汉朝',
      '西汉',
      '东汉'
    )
  }

  if (/周朝|封建制度|宗法制度|分封/u.test(cleaned)) {
    extras.push('西周', '东周', '分封制', '宗法制', '周天子', '周武王', '周公', '平王')
  }

  if (/中国文化|代表及特色|诸子百家|百家争鸣/u.test(cleaned)) {
    extras.push(
      '孔子',
      '儒家',
      '老子',
      '道家',
      '墨子',
      '韩非子',
      '百家争鸣',
      '论语',
      '法家',
      '德治',
      '礼治',
      '有教无类',
      '因材施教',
      '屈原',
      '端午节',
      '龙舟',
      '粽子'
    )
  }

  if (/语音与汉字/u.test(cleaned)) {
    extras.push('注音', '拼音', '汉字', '字形', '字音', '书写', '错别字', '识字')
  }

  if (/词语/u.test(cleaned)) {
    extras.push('词语', '词义', '成语', '解释', '运用', '搭配', '近义词', '反义词', '熟语')
  }

  if (/句子/u.test(cleaned)) {
    extras.push('句子', '语病', '病句', '句式', '停顿', '标点', '排序', '仿写', '连贯', '衔接')
  }

  if (/修辞/u.test(cleaned)) {
    extras.push('修辞', '比喻', '拟人', '夸张', '排比', '设问', '反问', '对偶', '借代', '引用', '通感', '反复')
  }

  if (/古典文学/u.test(cleaned)) {
    extras.push('古诗', '古文', '诗词', '诗句', '作者', '朝代', '默写', '赏析', '诗人', '词', '曲', '文言')
  }

  if (/现代文阅读/u.test(cleaned)) {
    extras.push('阅读理解', '现代文', '文章', '文本', '名著', '小说', '散文', '记叙文', '说明文', '议论文', '概括', '理解')
  }

  if (/写作技巧/u.test(cleaned)) {
    extras.push('表达方式', '写作技巧', '结构', '线索', '过渡', '开头', '结尾', '中心', '主题', '描写方法')
  }

  if (/文言文阅读-文本/u.test(cleaned)) {
    extras.push('文言文阅读', '文言文', '古文', '课内文言', '阅读下面的文言文', '翻译', '理解文意')
  }

  if (/文言文阅读-文言文基础/u.test(cleaned)) {
    extras.push('文言文基础', '加点词', '解释不正确', '注音', '翻译', '通假字', '古今异义', '词类活用', '一词多义', '句式', '虚词')
  }

  if (/中国各朝代的顺序|中国古代史|中国历史/u.test(cleaned)) {
    extras.push(
      '原始社会',
      '元谋人',
      '北京人',
      '山顶洞人',
      '半坡',
      '河姆渡',
      '炎帝',
      '黄帝',
      '尧',
      '舜',
      '禹',
      '禅让',
      '夏朝',
      '商朝',
      '西周',
      '春秋战国',
      '春秋',
      '战国',
      '秦朝',
      '汉朝',
      '甲骨文',
      '青铜器',
      '氏族',
      '农耕',
      '夏商周',
      '夏、商、西周',
      '夏商西周',
      '春秋五霸',
      '战国七雄',
      '春秋战国',
      '合纵',
      '连横',
      '平王东迁',
      '洛邑',
      '诸侯',
      '霸主',
      '周天子',
      '分封制',
      '宗法制',
      '礼乐',
      '民为贵',
      '君为轻',
      '葵丘会盟',
      '揭竿而起',
      '指鹿为马',
      '过家门而不入',
      '中国历史上第一个国家',
      '我国境内已知最早的人类',
      '黄帝的贡献',
      '中华文明',
      '文化名人'
    )
  }

  if (/秦始皇|秦朝|秦国/u.test(cleaned)) {
    extras.push(
      '秦始皇',
      '秦长城',
      '灵渠',
      '郡县制',
      '统一文字',
      '统一货币',
      '统一度量衡',
      '陈胜',
      '吴广',
      '大泽乡',
      '鱼腹丹书',
      '篝火狐鸣',
      '秦末',
      '灭秦',
      '反秦',
      '起义',
      '农民军',
      '赵高',
      '二世'
    )
  }

  if (/魏晋南北朝/u.test(cleaned)) {
    extras.push('三国', '曹操', '刘备', '孙权', '蜀汉', '曹魏', '东吴', '诸葛亮', '赤壁')
  }

  if (/清朝前期|清朝/u.test(cleaned)) {
    extras.push('康熙', '雍正', '乾隆', '和珅', '嘉庆', '清军入关', '闭关锁国')
  }

  if (/^历史的概念$/u.test(cleaned)) {
    extras.push(
      '史料',
      '历史文物',
      '第一手资料',
      '第二手资料',
      '考古',
      '文献',
      '古籍',
      '史实',
      '证据',
      '资料',
      '年代',
      '朝代'
    )
  }

  if (/(?:算术|代数|几何|统计学|集合论)/u.test(title)) {
    if (/^整数$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '整数',
        '有理数',
        '无理数',
        '正数',
        '负数',
        '相反数',
        '绝对值',
        '数轴',
        '数的大小',
        '比较大小',
        '倒数',
        '数的表示'
      )
    }
    if (/^自然数$/i.test(cleaned)) {
      addChapterKeywords(extras, '自然数', '计数', '数位', '位值', '数的组成', '整数部分', '进位')
    }
    if (/^分数$/i.test(cleaned)) {
      addChapterKeywords(extras, '分数', '约分', '通分', '真分数', '假分数', '带分数', '分数的大小', '分数比较')
    }
    if (/^小数$/i.test(cleaned)) {
      addChapterKeywords(extras, '小数', '小数点', '四舍五入', '近似数', '有限小数', '无限小数', '循环小数', '小数比较')
    }
    if (/^百分数$/i.test(cleaned)) {
      addChapterKeywords(extras, '百分数', '百分率', '折扣', '成数', '增长率', '降低率', '提高了', '减少了')
    }
    if (/^比与比例$/i.test(cleaned)) {
      addChapterKeywords(extras, '比', '比例', '比值', '比例尺', '正比例', '反比例', '比例关系')
    }
    if (/^记数制度$/i.test(cleaned)) {
      addChapterKeywords(extras, '记数', '记数制度', '科学记数法', '十进制', '进位制', '数位')
    }
    if (/^度量衡基本单位$/i.test(cleaned)) {
      addChapterKeywords(extras, '度量衡', '单位换算', '长度单位', '面积单位', '体积单位', '质量单位', '时间单位', '容积单位', 'km', 'm', 'cm', 'kg', 'g', 'L')
    }

    if (/^代数式$/i.test(cleaned)) {
      addChapterKeywords(extras, '代数式', '单项式', '多项式', '项', '系数', '次数', '同类项', '整式', '字母')
    }
    if (/^平方根与立方根$/i.test(cleaned)) {
      addChapterKeywords(extras, '平方根', '立方根', '算术平方根', '根号', '开方', '被开方数')
    }
    if (/^多项式$/i.test(cleaned)) {
      addChapterKeywords(extras, '多项式', '单项式', '次数', '项', '合并同类项', '升幂', '降幂')
    }
    if (/^因式分解$/i.test(cleaned)) {
      addChapterKeywords(extras, '因式分解', '提公因式', '平方差', '完全平方', '十字相乘', '分解因式')
    }
    if (/^方程式$/i.test(cleaned)) {
      addChapterKeywords(extras, '方程', '方程式', '一元一次方程', '二元一次方程', '解方程', '方程组', '应用题', '未知数')
    }
    if (/^直角坐标系与图像$/i.test(cleaned)) {
      addChapterKeywords(extras, '坐标', '直角坐标系', '图像', '函数', '变量', '自变量', '因变量', '点', '横坐标', '纵坐标')
    }
    if (/^分式$/i.test(cleaned)) {
      addChapterKeywords(extras, '分式', '约分', '通分', '分式方程', '分式的化简', '最简分式')
    }
    if (/^公式$/i.test(cleaned)) {
      addChapterKeywords(extras, '公式', '代入', '运用公式', '公式法')
    }
    if (/^不等式$/i.test(cleaned)) {
      addChapterKeywords(extras, '不等式', '不等式组', '解集', '解不等式', '解不等式组', '大于', '小于', '不大于', '不小于')
    }
    if (/^变数法$/i.test(cleaned)) {
      addChapterKeywords(extras, '变量', '变数法', '关系式', '函数关系', '变化', '变化率', '自变量', '因变量')
    }
    if (/^指数与对数$/i.test(cleaned)) {
      addChapterKeywords(extras, '指数', '对数', '幂', '指数幂', '科学记数法', '底数', '对数函数')
    }

    if (/^几何的基本概念$/i.test(cleaned)) {
      addChapterKeywords(extras, '点', '线', '射线', '线段', '直线', '角', '平行', '垂直', '相交', '顶点', '角平分线', '中点')
    }
    if (/^三角形$/i.test(cleaned)) {
      addChapterKeywords(extras, '三角形', '内角', '外角', '全等', '中线', '高', '角平分线', '等腰三角形', '等边三角形', '直角三角形')
    }
    if (/^四边形与多边形$/i.test(cleaned)) {
      addChapterKeywords(extras, '四边形', '多边形', '平行四边形', '矩形', '菱形', '正方形', '梯形', '内角和', '外角和')
    }
    if (/^周长面积表面积体积$/i.test(cleaned)) {
      addChapterKeywords(extras, '周长', '面积', '表面积', '体积', '长方体', '正方体', '圆柱', '圆锥', '棱柱', '棱锥')
    }
    if (/^轨迹$/i.test(cleaned)) {
      addChapterKeywords(extras, '轨迹', '动点', '轨迹问题', '点的轨迹')
    }
    if (/^毕氏定理$/i.test(cleaned)) {
      addChapterKeywords(extras, '毕氏定理', '勾股定理', '直角三角形', '斜边', '两直角边', '勾股')
    }
    if (/^相似形$/i.test(cleaned)) {
      addChapterKeywords(extras, '相似', '相似形', '相似三角形', '比例', '放大', '缩小', '对应边', '对应角')
    }
    if (/^圆$/i.test(cleaned)) {
      addChapterKeywords(extras, '圆', '半径', '直径', '弧', '圆心', '圆周率', '扇形', '圆面积', '圆周长')
    }
    if (/^几何变换$/i.test(cleaned)) {
      addChapterKeywords(extras, '几何变换', '平移', '旋转', '轴对称', '对称', '翻折', '变换')
    }
    if (/^三角函数$/i.test(cleaned)) {
      addChapterKeywords(extras, '三角函数', '正弦', '余弦', '正切', '锐角', '角度')
    }

    if (/^统计表与统计图$/i.test(cleaned)) {
      addChapterKeywords(extras, '统计', '统计表', '统计图', '条形图', '折线图', '扇形图', '频数', '频率')
    }
    if (/^集中趋势与四分位数$/i.test(cleaned)) {
      addChapterKeywords(extras, '平均数', '中位数', '众数', '四分位数', '集中趋势', '数据分析')
    }

    if (/^集合$/i.test(cleaned)) {
      addChapterKeywords(extras, '集合', '元素', '子集', '并集', '交集', '补集')
    }
    if (/^集合论的应用$/i.test(cleaned)) {
      addChapterKeywords(extras, '集合', '元素', '子集', '并集', '交集', '补集', '集合论的应用')
    }
  }

  if (/(?:科学|生物|物质科学|地球、宇宙与空间科学)/u.test(title)) {
    if (/^科学探究$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '科学探究',
        '科学实验室',
        '单位与测量',
        '观察',
        '实验',
        '猜想',
        '假设',
        '变量',
        '测量',
        '长度',
        '体积',
        '质量',
        '温度'
      )
    }

    if (/^生命的现象$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '生命现象',
        '生物的特征',
        '生物',
        '生命',
        '新陈代谢',
        '生长',
        '繁殖',
        '遗传',
        '适应',
        '应激',
        '细胞',
        '组织',
        '器官',
        '系统'
      )
    }

    if (/^生物体的组成$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '细胞',
        '细胞膜',
        '细胞质',
        '细胞核',
        '叶绿体',
        '细胞壁',
        '显微镜',
        '组织',
        '器官',
        '系统',
        '植物细胞',
        '动物细胞',
        '微生物'
      )
    }

    if (/^营养与健康$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '营养',
        '健康',
        '食物',
        '营养成分',
        '蛋白质',
        '糖类',
        '脂肪',
        '维生素',
        '无机盐',
        '膳食',
        '消化',
        '吸收',
        '合理饮食',
        '均衡膳食'
      )
    }

    if (/^光合作用$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '光合作用',
        '叶绿体',
        '光照',
        '二氧化碳',
        '氧气',
        '淀粉',
        '有机物',
        '绿色植物',
        '植物',
        '叶片',
        '绿叶',
        '夜晚',
        '暗处',
        '光合',
        '蒸腾',
        '制造有机物'
      )
    }

    if (/^消化和吸收$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '消化',
        '吸收',
        '消化系统',
        '胃',
        '小肠',
        '大肠',
        '唾液',
        '消化酶',
        '营养物质',
        '肝脏',
        '胰腺'
      )
    }

    if (/^呼吸$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '呼吸',
        '呼吸作用',
        '肺',
        '气体交换',
        '氧气',
        '二氧化碳',
        '呼吸系统',
        '肺泡',
        '胸廓',
        '绿色植物',
        '夜晚',
        '封闭',
        '室内',
        '植物呼吸'
      )
    }

    if (/^物质的运输$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '运输',
        '物质的运输',
        '血液',
        '心脏',
        '血管',
        '动脉',
        '静脉',
        '毛细血管',
        '输导组织',
        '导管',
        '筛管',
        '植物运输'
      )
    }

    if (/^协调与恒定$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '协调',
        '恒定',
        '神经',
        '激素',
        '反射',
        '神经系统',
        '内分泌',
        '体温',
        '血糖',
        '稳态'
      )
    }

    if (/^生殖与发育$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '生殖',
        '发育',
        '生长发育',
        '生长曲线',
        '青春期',
        '第二性征',
        '生殖器官',
        '主要生殖器官',
        '性激素',
        '受精',
        '受精卵',
        '胚胎',
        '胎儿',
        '种子萌发',
        '花粉',
        '胚',
        '有性生殖',
        '无性生殖',
        '喉结',
        '胡须',
        '月经',
        '变声'
      )
    }

    if (/^遗传与演化$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '遗传',
        '变异',
        '基因',
        'DNA',
        '性状',
        '染色体',
        '进化',
        '演化',
        '遗传信息',
        '进化论',
        '达尔文',
        '自然选择',
        '物种起源'
      )
    }

    if (/^生物与环境—生态系统$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '生态系统',
        '环境',
        '食物链',
        '食物网',
        '种群',
        '群落',
        '生物圈',
        '生态平衡',
        '能量流动',
        '物质循环'
      )
    }

    if (/^生物的多样性$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '多样性',
        '生物的多样性',
        '分类',
        '物种',
        '动物',
        '植物',
        '微生物',
        '细菌',
        '真菌',
        '藻类'
      )
    }

    if (/^物体与物质$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '物体',
        '物质',
        '密度',
        '质量',
        '体积',
        '状态',
        '固体',
        '液体',
        '气体',
        '混合物'
      )
    }

    if (/^质量守恒定律$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '质量守恒',
        '守恒',
        '化学反应',
        '反应前后',
        '质量不变',
        '质量守恒定律'
      )
    }

    if (/^能源与能量$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '能源',
        '能量',
        '能量转化',
        '能量守恒',
        '机械能',
        '内能',
        '电能',
        '热能',
        '光能',
        '化学能'
      )
    }

    if (/^热$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '热',
        '温度',
        '热传递',
        '热量',
        '热胀冷缩',
        '比热容',
        '熔化',
        '凝固',
        '汽化',
        '液化',
        '升华',
        '凝华'
      )
    }

    if (/^波$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '波',
        '声波',
        '波长',
        '频率',
        '振幅',
        '声音',
        '回声',
        '超声',
        '次声'
      )
    }

    if (/^光与色$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '光',
        '光与色',
        '反射',
        '折射',
        '透镜',
        '凸透镜',
        '凹透镜',
        '颜色',
        '成像',
        '镜面',
        '光路'
      )
    }

    if (/^电与磁$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '电与磁',
        '电路',
        '电流',
        '电压',
        '电阻',
        '串联',
        '并联',
        '开关',
        '电源',
        '磁场',
        '电磁',
        '电磁铁',
        '导体',
        '绝缘体'
      )
    }

    if (/^力与运动$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '力',
        '运动',
        '速度',
        '重力',
        '摩擦力',
        '惯性',
        '压强',
        '浮力',
        '牛顿',
        '受力'
      )
    }

    if (/^地球运动与效应$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '地球运动',
        '自转',
        '公转',
        '昼夜',
        '四季',
        '日月星辰',
        '地轴',
        '太阳直射',
        '黄赤交角'
      )
    }

    if (/^地球的概貌$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        '地球',
        '经纬',
        '经线',
        '纬线',
        '地图',
        '比例尺',
        '地形',
        '海陆分布',
        '板块'
      )
    }

    if (/^土壤$/i.test(cleaned)) {
      addChapterKeywords(extras, '土壤', '土层', '腐殖质', '土壤类型', '土壤形成')
    }

    if (/^岩石$/i.test(cleaned)) {
      addChapterKeywords(extras, '岩石', '岩浆岩', '沉积岩', '变质岩', '地质作用')
    }

    if (/^矿物$/i.test(cleaned)) {
      addChapterKeywords(extras, '矿物', '矿物质', '晶体', '硬度', '光泽', '解理')
    }

    if (/^水$/i.test(cleaned)) {
      addChapterKeywords(extras, '水', '水循环', '水资源', '蒸发', '降水', '水的三态', '液态')
    }

    if (/^大气$/i.test(cleaned)) {
      addChapterKeywords(extras, '大气', '天气', '气压', '风', '湿度', '气温', '气候', '云', '降水')
    }

    if (/^太阳系$/i.test(cleaned)) {
      addChapterKeywords(extras, '太阳系', '太阳', '行星', '地球', '月球', '天体', '轨道', '恒星')
    }

    if (/^星与星系$/i.test(cleaned)) {
      addChapterKeywords(extras, '星', '星系', '恒星', '星座', '银河系', '宇宙')
    }

    if (/^宇宙$/i.test(cleaned)) {
      addChapterKeywords(extras, '宇宙', '星系', '银河', '天体', '宇宙探索')
    }

    if (/^天文与太空探索的发展$/i.test(cleaned)) {
      addChapterKeywords(extras, '太空', '天文', '航天', '火箭', '卫星', '探测器', '宇航员', '空间站')
    }
  }

  if (isScienceBiosphereLeaf) {
    addChapterKeywords(extras, '生物圈', '生态', '生态系统', '环境', '生物与环境', '地球生物')
  }

  if (/(?:Context|Text Types|Forms and Functions|Vocabulary|Grammar)/i.test(title)) {
    if (/^Beliefs$/i.test(cleaned)) {
      addChapterKeywords(extras, 'belief', 'beliefs', 'religion', 'religious', 'god', 'gods', 'pray', 'church', 'temple', 'mosque', 'worship')
    }
    if (/^Entertainment$/i.test(cleaned)) {
      addChapterKeywords(extras, 'entertainment', 'music', 'movie', 'film', 'guitar', 'dance', 'game', 'games', 'hobby', 'concert', 'show', 'watch tv')
    }
    if (/^Festivals$/i.test(cleaned)) {
      addChapterKeywords(extras, 'festival', 'festivals', 'celebration', 'celebrate', 'christmas', 'spring festival', 'thanksgiving', 'halloween', 'dragon boat', 'mid-autumn', 'holiday')
    }
    if (/^Food and Drinks$/i.test(cleaned)) {
      addChapterKeywords(extras, 'food', 'drink', 'drinks', 'breakfast', 'lunch', 'dinner', 'meal', 'eat', 'eating', 'cook', 'cooking', 'snack', 'menu', 'kitchen')
    }
    if (/^Giving Directions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'direction', 'directions', 'give directions', 'turn left', 'turn right', 'go along', 'next to', 'across from', 'in front of', 'behind', 'near', 'between', 'opposite', 'street', 'road', 'map', 'way to')
    }
    if (/^Health and Exercise$/i.test(cleaned)) {
      addChapterKeywords(extras, 'health', 'healthy', 'exercise', 'exercises', 'sport', 'sports', 'run', 'running', 'walk', 'walking', 'sleep', 'doctor', 'hospital', 'ill', 'illness', 'body')
    }
    if (/^History$/i.test(cleaned)) {
      addChapterKeywords(extras, 'history', 'historical', 'ancient', 'past', 'emperor', 'dynasty', 'kingdom', 'war', 'battle', 'museum', 'tradition', 'traditions')
    }
    if (/^Lifestyles$/i.test(cleaned)) {
      addChapterKeywords(extras, 'lifestyle', 'lifestyles', 'habit', 'habits', 'routine', 'daily', 'usually', 'often', 'sometimes', 'always', 'never', 'every day', 'get up', 'go to bed')
    }
    if (/^People$/i.test(cleaned)) {
      addChapterKeywords(extras, 'people', 'person', 'family', 'families', 'friend', 'friends', 'classmate', 'classmates', 'student', 'students', 'teacher', 'teachers', 'parents', 'mother', 'father', 'brother', 'sister', 'grandpa', 'grandma')
    }
    if (/^Places and Buildings$/i.test(cleaned)) {
      addChapterKeywords(extras, 'place', 'places', 'building', 'buildings', 'school', 'home', 'house', 'library', 'park', 'shop', 'store', 'hospital', 'restaurant', 'zoo', 'office', 'room')
    }
    if (/^School and Study$/i.test(cleaned)) {
      addChapterKeywords(extras, 'school', 'study', 'studying', 'class', 'classes', 'lesson', 'lessons', 'homework', 'exam', 'test', 'teacher', 'student', 'students', 'classroom', 'library', 'blackboard', 'subject')
    }
    if (/^Science and Technology$/i.test(cleaned)) {
      addChapterKeywords(extras, 'science', 'scientific', 'technology', 'tech', 'computer', 'computers', 'internet', 'robot', 'robots', 'machine', 'machines', 'phone', 'mobile', 'online', 'app')
    }
    if (/^Social Issues and Civic-mindedness$/i.test(cleaned)) {
      addChapterKeywords(extras, 'social', 'society', 'civic', 'civic-mindedness', 'environment', 'pollution', 'protect', 'save', 'recycle', 'community', 'volunteer', 'safety', 'rule', 'rules', 'traffic rules')
    }
    if (/^The Natural World$/i.test(cleaned)) {
      addChapterKeywords(extras, 'weather', 'rain', 'raining', 'rainy', 'sunny', 'cloudy', 'windy', 'snowy', 'storm', 'season', 'seasons', 'animal', 'animals', 'plant', 'plants', 'nature', 'natural', 'forest', 'river', 'mountain', 'sky')
    }
    if (/^Transport$/i.test(cleaned)) {
      addChapterKeywords(
        extras,
        'transport',
        'transportation',
        'traffic',
        'bus',
        'buses',
        'bike',
        'bicycle',
        'train',
        'subway',
        'car',
        'taxi',
        'ride',
        'drive',
        'walk to school',
        'get to school',
        'go to school',
        'to school',
        'take the bus',
        'takes the bus',
        'by bus',
        'ride a bike',
        'by bike'
      )
    }
    if (/^Travel and Holidays$/i.test(cleaned)) {
      addChapterKeywords(extras, 'travel', 'travelling', 'traveling', 'trip', 'holiday', 'holidays', 'vacation', 'journey', 'airport', 'hotel', 'tour', 'tourist', 'sightseeing')
    }
    if (/^Work and Jobs$/i.test(cleaned)) {
      addChapterKeywords(extras, 'work', 'job', 'jobs', 'worker', 'workers', 'occupation', 'occupations', 'doctor', 'nurse', 'teacher', 'driver', 'cook', 'farmer', 'singer', 'actor', 'policeman', 'policewoman')
    }

    if (/^Articles and Reports$/i.test(cleaned)) {
      addChapterKeywords(extras, 'article', 'articles', 'report', 'reports', 'news', 'newspaper', 'magazine', 'survey')
    }
    if (/^Conversations, Dialogues and Interviews$/i.test(cleaned)) {
      addChapterKeywords(extras, 'conversation', 'conversations', 'dialogue', 'dialogues', 'interview', 'interviews', 'complete the dialogue', 'the following conversation', 'the following dialogue')
    }
    if (/^Descriptions of People, Things, Places, Scenes$/i.test(cleaned)) {
      addChapterKeywords(extras, 'description', 'describe', 'descriptions', 'people', 'things', 'places', 'scenes', 'scene', 'picture', 'photo', 'photos')
    }
    if (/^Facts and Opinions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'fact', 'facts', 'opinion', 'opinions', 'true or false', 'fact and opinion')
    }
    if (/^Journals and Diaries$/i.test(cleaned)) {
      addChapterKeywords(extras, 'journal', 'journals', 'diary', 'diaries', 'today', 'yesterday', 'tomorrow', 'date')
    }
    if (/^Letters$/i.test(cleaned)) {
      addChapterKeywords(extras, 'letter', 'letters', 'dear', 'yours', 'sincerely', 'best wishes')
    }
    if (/^Messages$/i.test(cleaned)) {
      addChapterKeywords(extras, 'message', 'messages', 'note', 'notes', 'text message', 'sms')
    }
    if (/^Processes and Procedures$/i.test(cleaned)) {
      addChapterKeywords(extras, 'process', 'processes', 'procedure', 'procedures', 'steps', 'step 1', 'first', 'next', 'then', 'finally', 'how to', 'instruction', 'instructions', 'recipe')
    }
    if (/^Speeches and Talks$/i.test(cleaned)) {
      addChapterKeywords(extras, 'speech', 'speeches', 'talk', 'talks', 'presentation', 'presentations', 'report to class')
    }
    if (/^Narratives$/i.test(cleaned)) {
      addChapterKeywords(extras, 'narrative', 'narratives', 'story', 'stories', 'story about', 'passage', 'reading', 'reading passage', 'tale', 'novel')
    }

    if (/^Asking for and Giving Advice$/i.test(cleaned)) {
      addChapterKeywords(extras, 'advice', 'give advice', 'ask for advice', 'should', "shouldn't", 'had better', 'why not', 'how about')
    }
    if (/^Expressing Agreement and Disagreement$/i.test(cleaned)) {
      addChapterKeywords(extras, 'agree', 'agreement', 'disagree', 'disagreement', 'so do i', 'neither do i', 'i think so', 'i do not think so')
    }
    if (/^Arguments$/i.test(cleaned)) {
      addChapterKeywords(extras, 'argument', 'arguments', 'argue', 'arguing')
    }
    if (/^Asking for and Giving Directions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'direction', 'directions', 'turn left', 'turn right', 'go along', 'next to', 'across from', 'in front of', 'behind', 'near', 'map', 'way to')
    }
    if (/^Asking for and Giving Information$/i.test(cleaned)) {
      addChapterKeywords(extras, 'information', 'ask for information', 'give information', 'where is', 'what time', 'how much', 'how many', 'how long', 'how often', 'what color', 'which one')
    }
    if (/^Making Comparisons$/i.test(cleaned)) {
      addChapterKeywords(extras, 'compare', 'comparison', 'comparisons', 'than', 'more than', 'better than', 'as ... as', 'as...as', 'the most')
    }
    if (/^Making and Responding to Complaints$/i.test(cleaned)) {
      addChapterKeywords(extras, 'complaint', 'complaints', 'complain', 'problem', 'wrong with', 'not working', 'broken')
    }
    if (/^Showing Concern$/i.test(cleaned)) {
      addChapterKeywords(extras, "what's wrong", "what's the matter", 'concern', 'worried', 'worry', 'take care', 'be careful', 'get well soon', 'look after')
    }
    if (/^Giving Descriptions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'describe', 'description', 'descriptions', 'looks', 'appearance', 'tall', 'short', 'thin', 'fat', 'beautiful', 'handsome')
    }
    if (/^Expressing Doubt$/i.test(cleaned)) {
      addChapterKeywords(extras, 'doubt', 'doubtful', 'maybe', 'perhaps', 'not sure', 'i wonder')
    }
    if (/^Giving Encouragement$/i.test(cleaned)) {
      addChapterKeywords(extras, 'encouragement', 'encourage', 'come on', "don't worry", 'try your best', 'keep going')
    }
    if (/^Conveying Greetings$/i.test(cleaned)) {
      addChapterKeywords(extras, 'greeting', 'greetings', 'hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'nice to meet you')
    }
    if (/^Expressing Hesitation$/i.test(cleaned)) {
      addChapterKeywords(extras, 'hesitation', 'hesitate', 'well', 'um', 'er', 'you know')
    }
    if (/^Making Introductions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'introduce', 'introduction', 'introductions', 'this is', 'my name is', 'let me introduce')
    }
    if (/^Expressing Likes and Dislikes$/i.test(cleaned)) {
      addChapterKeywords(extras, 'like', 'likes', 'love', 'loves', 'enjoy', 'enjoys', 'prefer', 'prefers', 'dislike', 'dislikes', 'hate', 'hates', 'favorite', 'favourite')
    }
    if (/^Making Predictions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'prediction', 'predict', 'predictions', 'will', 'going to', 'be going to', 'in the future', 'maybe', 'perhaps')
    }
    if (/^Giving Offers$/i.test(cleaned)) {
      addChapterKeywords(extras, 'offer', 'offers', 'would you like', 'can i help', 'shall i', 'let me', 'help you')
    }
    if (/^Expressing Opinions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'opinion', 'opinions', 'think', 'believe', 'in my opinion', 'i think', 'i believe')
    }
    if (/^Seeking and Granting Permission$/i.test(cleaned)) {
      addChapterKeywords(extras, 'permission', 'permit', 'allowed', 'may i', 'can i', 'could i', 'be allowed to')
    }
    if (/^Expressing Possibility$/i.test(cleaned)) {
      addChapterKeywords(extras, 'possibility', 'possible', 'possibly', 'may', 'might', 'could', 'probably')
    }
    if (/^Making Promises$/i.test(cleaned)) {
      addChapterKeywords(extras, 'promise', 'promises', 'promise to', 'will', 'i will')
    }
    if (/^Giving Reasons$/i.test(cleaned)) {
      addChapterKeywords(extras, 'reason', 'reasons', 'because', 'because of', 'why')
    }
    if (/^Making Requests$/i.test(cleaned)) {
      addChapterKeywords(extras, 'request', 'requests', 'please', 'could you', 'would you', 'can you', 'would you mind')
    }
    if (/^Expressing Satisfaction and Dissatisfaction$/i.test(cleaned)) {
      addChapterKeywords(extras, 'satisfied', 'satisfaction', 'dissatisfied', 'dissatisfaction', 'happy', 'unhappy', 'pleased', 'disappointed', 'upset')
    }
    if (/^Making and Giving Suggestions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'suggestion', 'suggestions', 'suggest', 'let us', "let's", 'why not', 'how about', 'should', 'had better')
    }
    if (/^Showing Sympathy$/i.test(cleaned)) {
      addChapterKeywords(extras, 'sympathy', 'sympathetic', 'sorry to hear', 'what a pity', 'feel sorry')
    }
    if (/^Issuing Warning$/i.test(cleaned)) {
      addChapterKeywords(extras, 'warning', 'warn', 'be careful', "don't", "mustn't", 'watch out', 'danger')
    }
    if (/^Making Enquiries$/i.test(cleaned)) {
      addChapterKeywords(extras, 'enquiry', 'enquiries', 'inquiry', 'inquiries', 'ask', 'question', 'questions', 'interview')
    }
    if (/^Congratulations$/i.test(cleaned)) {
      addChapterKeywords(extras, 'congratulation', 'congratulations', 'well done', 'good job', 'great job')
    }
    if (/^Making Apologies$/i.test(cleaned)) {
      addChapterKeywords(extras, 'apology', 'apologies', 'apologize', 'apologise', 'sorry')
    }
    if (/^Extending Invitations$/i.test(cleaned)) {
      addChapterKeywords(extras, 'invitation', 'invitations', 'invite', 'would you like to', "let's", 'come with me')
    }

    if (/^Glossary$/i.test(cleaned)) {
      addChapterKeywords(extras, 'glossary', 'vocabulary', 'word list', 'new words', 'words and expressions')
    }
    if (/^Idioms$/i.test(cleaned)) {
      addChapterKeywords(extras, 'idiom', 'idioms', 'idiomatic')
    }
    if (/^Proverbs$/i.test(cleaned)) {
      addChapterKeywords(extras, 'proverb', 'proverbs', 'saying', 'sayings')
    }
    if (/^Phrasal Verbs$/i.test(cleaned)) {
      addChapterKeywords(extras, 'phrasal verb', 'phrasal verbs', 'put on', 'take off', 'look after', 'give up', 'get up', 'turn on', 'turn off')
    }
    if (/^Synonyms$/i.test(cleaned)) {
      addChapterKeywords(extras, 'synonym', 'synonyms', 'same meaning', 'similar meaning', 'replace with', 'another word')
    }

    if (/^Nouns$/i.test(cleaned)) {
      addChapterKeywords(extras, 'noun', 'nouns', 'countable', 'uncountable', 'singular', 'plural', 'possessive', 'possessive noun')
    }
    if (/^Pronouns$/i.test(cleaned)) {
      addChapterKeywords(extras, 'pronoun', 'pronouns', 'personal pronoun', 'reflexive pronoun', 'possessive pronoun', 'subject pronoun', 'object pronoun', 'he', 'she', 'it', 'they', 'him', 'her', 'them', 'my', 'mine', 'your', 'yours', 'our', 'ours', 'their', 'theirs', 'this', 'that', 'these', 'those', 'someone', 'anyone', 'everyone', 'nobody')
    }
    if (/^Articles$/i.test(cleaned)) {
      addChapterKeywords(extras, 'article', 'articles', 'a', 'an', 'the', 'zero article')
    }
    if (/^Adjectives and Comparison of Adjectives$/i.test(cleaned)) {
      addChapterKeywords(extras, 'adjective', 'adjectives', 'comparative', 'superlative', 'than', 'more', 'most', 'less', 'least', 'as ... as', 'as...as', 'better', 'worse')
    }
    if (/^Adverbs$/i.test(cleaned)) {
      addChapterKeywords(extras, 'adverb', 'adverbs', 'well', 'very', 'too', 'enough', 'really', 'quickly', 'slowly', 'carefully', 'loudly')
    }
    if (/^Prepositions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'preposition', 'prepositions', 'in', 'on', 'at', 'from', 'into', 'under', 'over', 'between', 'among', 'behind', 'beside', 'with', 'before', 'after', 'during', 'by')
    }
    if (/^Conjunctions$/i.test(cleaned)) {
      addChapterKeywords(extras, 'conjunction', 'conjunctions', 'and', 'but', 'or', 'so', 'because', 'although', 'if', 'when', 'while')
    }
    if (/^Verbs$/i.test(cleaned)) {
      addChapterKeywords(extras, 'verb', 'verbs', 'tense', 'tenses', 'be verb', 'action verb', 'present simple', 'past simple', 'present continuous', 'past continuous', 'present perfect', 'future tense', 'play', 'go', 'take', 'have', 'do', 'make', 'get', 'come', 'see', 'say', 'tell', 'write', 'read', 'speak', 'listen', 'live', 'study', 'work', 'walk', 'run', 'swim', 'sleep', 'eat', 'drink', 'wear', 'hold', 'invite', 'follow', 'clean', 'finish', 'plan', 'try', 'help', 'think', 'know', 'want', 'need', 'like', 'love', 'usually', 'often', 'sometimes', 'always', 'never', 'now', 'today', 'seldom', 'look', 'look at')
    }
    if (/^Infinitives and Gerunds$/i.test(cleaned)) {
      addChapterKeywords(extras, 'infinitive', 'infinitives', 'gerund', 'gerunds', 'to do', 'doing', 'without doing', 'without', 'without invite', 'without inviting', 'party without', 'invite', 'inviting', 'to invite', 'enjoy doing', 'finish doing', 'mind doing', 'practice doing', 'keep doing', 'stop doing', 'remember to do', 'forget to do', 'want to do', 'need to do')
    }
    if (/^The Participles$/i.test(cleaned)) {
      addChapterKeywords(extras, 'participle', 'participles', 'present participle', 'past participle', '-ing', '-ed', 'doing', 'done')
    }
    if (/^The Conditional Tenses$/i.test(cleaned)) {
      addChapterKeywords(extras, 'conditional', 'conditionals', 'if', 'unless', 'would', 'could', 'should', 'first conditional', 'second conditional')
    }
    if (/^Determiners$/i.test(cleaned)) {
      addChapterKeywords(extras, 'determiner', 'determiners', 'many', 'much', 'some', 'any', 'each', 'every', 'another', 'other', 'few', 'little', 'a lot of', 'lots of')
    }
    if (/^Modals$/i.test(cleaned)) {
      addChapterKeywords(extras, 'modal', 'modals', 'can', 'could', 'may', 'might', 'must', 'should', 'shall', 'will', 'would', 'ought to')
    }
    if (/^Direct and Indirect Speech$/i.test(cleaned)) {
      addChapterKeywords(extras, 'direct speech', 'indirect speech', 'reported speech', 'said', 'told', 'asked', 'ask', 'tell')
    }
    if (/^Question Tags$/i.test(cleaned)) {
      addChapterKeywords(extras, 'question tag', 'question tags', "isn't it", "don't you", "doesn't he", "aren't they", 'tag question')
    }
    if (/^Negative Form and Interrogative Form$/i.test(cleaned)) {
      addChapterKeywords(extras, 'negative', 'interrogative', 'question', 'questions', 'do not', "don't", "doesn't", "didn't", 'not', 'question mark')
    }
    if (/^Punctuations$/i.test(cleaned)) {
      addChapterKeywords(extras, 'punctuation', 'punctuations', 'comma', 'period', 'full stop', 'question mark', 'exclamation mark', 'apostrophe', 'quotation marks', 'colon', 'semicolon')
    }
    if (/^Phrases and Clauses$/i.test(cleaned)) {
      addChapterKeywords(extras, 'phrase', 'phrases', 'clause', 'clauses', 'main clause', 'subordinate clause', 'relative clause')
    }
    if (/^Sentence Types$/i.test(cleaned)) {
      addChapterKeywords(extras, 'sentence type', 'sentence types', 'statement', 'question', 'exclamation', 'imperative', 'declarative', 'interrogative', 'exclamatory')
    }
  }

  const baseParts = isScienceBiosphereLeaf
    ? parts.filter((part) => part !== '生物')
    : parts
  const baseCleaned = isScienceBiosphereLeaf || isHistoryConceptLeaf ? '' : cleaned
  const filteredParts = isHistoryConceptLeaf
    ? baseParts.filter((part) => part !== '历史' && part !== '概念')
    : baseParts

  return Array.from(new Set([baseCleaned, ...filteredParts, ...extras].filter(Boolean)))
}

function stringifyAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return ''
  if (typeof answer === 'string') return answer
  if (typeof answer === 'number' || typeof answer === 'boolean') {
    return String(answer)
  }
  if (Array.isArray(answer)) {
    return answer.map((item) => stringifyAnswer(item)).filter(Boolean).join(' ')
  }
  if (typeof answer === 'object') {
    return Object.entries(answer as Record<string, unknown>)
      .map(([key, value]) => `${key} ${stringifyAnswer(value)}`)
      .filter((item) => item.trim().length > 0)
      .join(' ')
  }
  return String(answer)
}

function buildQuestionFields(input: ChapterTaggingInput): Array<{
  name: keyof typeof FIELD_WEIGHTS
  text: string
  weight: number
}> {
  const sourceText = [
    input.source ?? '',
    input.sourceFile?.filename ?? '',
    input.sourceFile?.sourceNote ?? '',
  ]
    .filter((value) => value && value.trim().length > 0)
    .join(' ')

  const optionsText = input.options
    ? Object.entries(input.options)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, value]) => `${key} ${value}`)
        .join(' ')
    : ''

  return [
    { name: 'content' as const, text: input.content, weight: FIELD_WEIGHTS.content },
    { name: 'options' as const, text: optionsText, weight: FIELD_WEIGHTS.options },
    {
      name: 'answer' as const,
      text: stringifyAnswer(input.answer),
      weight: FIELD_WEIGHTS.answer,
    },
    {
      name: 'explanation' as const,
      text: input.explanation ?? '',
      weight: FIELD_WEIGHTS.explanation,
    },
    { name: 'source' as const, text: sourceText, weight: FIELD_WEIGHTS.source },
    {
      name: 'tags' as const,
      text: (input.tags ?? []).join(' '),
      weight: FIELD_WEIGHTS.tags,
    },
  ].filter((field) => field.text.trim().length > 0)
}

function scoreCandidate(
  fields: Array<{
    name: keyof typeof FIELD_WEIGHTS
    text: string
    weight: number
  }>,
  candidate: ChapterCandidate
): {
  score: number
  evidence: string | null
} {
  if (fields.length === 0) return { score: 0, evidence: null }

  let score = 0
  let bestEvidence: { score: number; label: string } | null = null
  const normalizedShortTitle = normalizeText(candidate.shortTitle)
  const candidateKeywords = candidate.keywords.filter(
    (keyword) => keyword.trim().length >= 2
  )

  for (const field of fields) {
    const normalizedFieldText = normalizeText(field.text)
    if (!normalizedFieldText) continue

    if (normalizedShortTitle && normalizedFieldText.includes(normalizedShortTitle)) {
      const contribution =
        field.weight * Math.max(7, Math.min(normalizedShortTitle.length + 2, 12))
      score += contribution
      if (!bestEvidence || contribution > bestEvidence.score) {
        bestEvidence = {
          score: contribution,
          label: `${FIELD_NAMES[field.name]}命中${candidate.shortTitle}`,
        }
      }
    }

    for (const keyword of candidateKeywords) {
      const normalizedKeyword = normalizeText(keyword)
      if (!normalizedKeyword || normalizedKeyword.length < 2) continue
      if (!normalizedFieldText.includes(normalizedKeyword)) continue

      const baseContribution =
        normalizedKeyword.length >= 8
          ? 7
          : normalizedKeyword.length >= 5
            ? 6
            : 5
      const contribution = field.weight * baseContribution
      score += contribution

      if (!bestEvidence || contribution > bestEvidence.score) {
        bestEvidence = {
          score: contribution,
          label: `${FIELD_NAMES[field.name]}命中${keyword}`,
        }
      }
    }
  }

  return {
    score,
    evidence: bestEvidence?.label ?? null,
  }
}

function extractRuleSuggestion(
  input: ChapterTaggingInput,
  candidates: ChapterCandidate[]
): {
  direct: ChapterTaggingSuggestion | null
  shortlist: ChapterCandidate[]
} {
  const fields = buildQuestionFields(input)
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      ...scoreCandidate(fields, candidate),
    }))
    .sort((left, right) => right.score - left.score)

  const top = ranked[0]
  const second = ranked[1]

  if (
    top &&
    top.score >= RULE_ASSIGN_SCORE &&
    top.score - (second?.score ?? 0) >= RULE_ASSIGN_MARGIN
  ) {
    return {
      direct: {
        questionId: input.id,
        chapterId: top.candidate.id,
        strategy: 'rule',
        confidence: Math.min(0.95, 0.55 + top.score / 20),
        reason: top.evidence
          ? `规则命中${top.evidence}`
          : `规则命中章节关键词：${top.candidate.shortTitle}`,
      },
      shortlist: ranked
        .filter((item) => item.score > 0)
        .slice(0, MAX_AI_CANDIDATES)
        .map((item) => item.candidate),
    }
  }

  return {
    direct: null,
    shortlist: ranked
      .filter((item) => item.score > 0)
      .slice(0, MAX_AI_CANDIDATES)
      .map((item) => item.candidate),
  }
}

function parseJsonBlock(text: string): unknown {
  const jsonMatch =
    text.match(/```json\s*([\s\S]*?)\s*```/u) ||
    text.match(/```\s*([\s\S]*?)\s*```/u)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  return JSON.parse(jsonText.trim())
}

async function loadSourceContexts(
  sourceFileIds: string[]
): Promise<Map<string, QuestionSourceContext>> {
  const uniqueIds = Array.from(new Set(sourceFileIds.filter((value) => Boolean(value))))
  if (uniqueIds.length === 0) {
    return new Map()
  }

  const sourceFiles = await prisma.sourceFile.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      filename: true,
      sourceNote: true,
      fileUrl: true,
    },
  })

  return new Map(
    sourceFiles.map((sourceFile) => [
      sourceFile.id,
      {
        filename: sourceFile.filename,
        sourceNote: sourceFile.sourceNote,
        fileUrl: sourceFile.fileUrl,
      } satisfies QuestionSourceContext,
    ])
  )
}

class ChapterTaggingAI {
  private anthropicClient: Anthropic | null
  private geminiClient: GoogleGenerativeAI | null

  constructor() {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim()
    const geminiApiKey =
      process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()

    this.anthropicClient = anthropicApiKey
      ? new Anthropic({ apiKey: anthropicApiKey })
      : null
    this.geminiClient = geminiApiKey
      ? new GoogleGenerativeAI(geminiApiKey)
      : null
  }

  get available(): boolean {
    return Boolean(this.geminiClient || this.anthropicClient)
  }

  async tagBatch(
    batch: Array<{
      questionId: string
      content: string
      explanation?: string | null
      options?: Record<string, string> | null
      answer?: unknown
      tags?: string[]
      source?: string | null
      sourceFile?: QuestionSourceContext | null
      candidates: ChapterCandidate[]
    }>
  ): Promise<Map<string, ChapterTaggingSuggestion>> {
    if (batch.length === 0) {
      return new Map()
    }

    const prompt = `你是题库章节打标助手。请只从给定候选叶子章节中为每道题选择一个最匹配的章节，若都不合适就返回 null。

规则：
1. 只能从候选 chapterId 中选择。
2. 如果题目与候选都不够匹配，chapterId 返回 null。
3. 请综合题干、选项、答案、解析、来源一起判断。
4. confidence 取 0 到 1 之间的小数。
5. reason 用简短中文，20 字以内。
6. 只返回 JSON，不要解释。

输入：
${JSON.stringify(
      batch.map((item) => ({
        questionId: item.questionId,
        content: item.content,
        explanation: item.explanation ?? '',
        options: item.options ?? {},
        answer: item.answer ?? null,
        tags: item.tags ?? [],
        source: item.source ?? '',
        sourceFile: item.sourceFile ?? null,
        candidates: item.candidates.map((candidate) => ({
          chapterId: candidate.id,
          title: candidate.title,
        })),
      })),
      null,
      2
    )}

输出格式：
[
  {
    "questionId": "uuid",
    "chapterId": "uuid 或 null",
    "confidence": 0.82,
    "reason": "命中辛亥革命"
  }
]`

    try {
      const parsed = this.geminiClient
        ? await this.tagBatchWithGemini(prompt)
        : this.anthropicClient
          ? await this.tagBatchWithAnthropic(prompt)
          : null

      if (!Array.isArray(parsed)) {
        return new Map()
      }

      return new Map(
        parsed
          .filter(
            (
              item
            ): item is {
              questionId: string
              chapterId: string | null
              confidence?: number
              reason?: string
            } => Boolean(item && typeof item === 'object' && 'questionId' in item)
          )
          .map((item) => [
            item.questionId,
            {
              questionId: item.questionId,
              chapterId: item.chapterId ?? null,
              strategy: item.chapterId ? 'ai' : 'none',
              confidence:
                typeof item.confidence === 'number'
                  ? Math.max(0, Math.min(1, item.confidence))
                  : 0.55,
              reason: item.reason?.trim() || 'AI 未提供原因',
            } satisfies ChapterTaggingSuggestion,
          ])
      )
    } catch (error) {
      console.error('AI chapter tagging failed:', error)
      return new Map()
    }
  }

  private async tagBatchWithGemini(prompt: string): Promise<unknown> {
    if (!this.geminiClient) return null

    const model = this.geminiClient.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1400,
        responseMimeType: 'application/json',
      },
    })

    const response = await model.generateContent(prompt)
    const text = response.response.text()
    return parseJsonBlock(text)
  }

  private async tagBatchWithAnthropic(prompt: string): Promise<unknown> {
    if (!this.anthropicClient) return null

    const response = await this.anthropicClient.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1400,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const firstBlock = response.content[0]
    if (firstBlock?.type !== 'text') {
      return null
    }

    return parseJsonBlock(firstBlock.text)
  }
}

async function getLeafChaptersBySubjectId(
  subjectId: string
): Promise<ChapterCandidate[]> {
  const chapters = await prisma.chapter.findMany({
    where: { subjectId },
    select: { id: true, title: true, parentId: true, order: true },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
  })

  if (chapters.length === 0) return []

  const parentIds = new Set(
    chapters
      .map((chapter) => chapter.parentId)
      .filter((value): value is string => Boolean(value))
  )

  return chapters
    .filter((chapter) => !parentIds.has(chapter.id))
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      shortTitle: cleanChapterTitle(chapter.title),
      keywords: buildChapterKeywords(chapter.title),
    }))
}

export async function suggestQuestionChapters(
  questions: ChapterTaggingInput[]
): Promise<ChapterTaggingSuggestion[]> {
  if (questions.length === 0) return []

  const subjectIds = Array.from(
    new Set(
      questions
        .map((question) => question.subjectId)
        .filter((subjectId): subjectId is string => Boolean(subjectId))
    )
  )

  const chaptersBySubject = new Map<string, ChapterCandidate[]>()
  await Promise.all(
    subjectIds.map(async (subjectId) => {
      chaptersBySubject.set(
        subjectId,
        await getLeafChaptersBySubjectId(subjectId)
      )
    })
  )

  const sourceContextMap = await loadSourceContexts(
    questions
      .map((question) => question.sourceFileId)
      .filter((value): value is string => Boolean(value))
  )

  const suggestions = new Map<string, ChapterTaggingSuggestion>()
  const aiPending: Array<{
    questionId: string
    content: string
    explanation?: string | null
    options?: Record<string, string> | null
    answer?: unknown
    tags?: string[]
    source?: string | null
    sourceFile?: QuestionSourceContext | null
    candidates: ChapterCandidate[]
  }> = []

  for (const question of questions) {
    if (question.chapterId) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: question.chapterId,
        strategy: 'existing',
        confidence: 1,
        reason: '题目已存在章节标记',
      })
      continue
    }

    if (!question.subjectId) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: null,
        strategy: 'none',
        confidence: 0,
        reason: '题目缺少科目，无法推断章节',
      })
      continue
    }

    const chapterCandidates = chaptersBySubject.get(question.subjectId) || []
    if (chapterCandidates.length === 0) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: null,
        strategy: 'none',
        confidence: 0,
        reason: '当前科目没有叶子章节',
      })
      continue
    }

    const sourceFile =
      question.sourceFile ?? sourceContextMap.get(question.sourceFileId ?? '') ?? null
    const enrichedQuestion = {
      ...question,
      sourceFile,
    }

    const ruleResult = extractRuleSuggestion(enrichedQuestion, chapterCandidates)
    if (ruleResult.direct) {
      suggestions.set(question.id, ruleResult.direct)
      continue
    }

    aiPending.push({
      questionId: question.id,
      content: enrichedQuestion.content,
      explanation: enrichedQuestion.explanation ?? '',
      options: enrichedQuestion.options ?? {},
      answer: enrichedQuestion.answer,
      tags: enrichedQuestion.tags ?? [],
      source: enrichedQuestion.source ?? '',
      sourceFile: enrichedQuestion.sourceFile,
      candidates:
        ruleResult.shortlist.length > 0
          ? ruleResult.shortlist
          : chapterCandidates.slice(0, MAX_AI_CANDIDATES),
    })
  }

  const aiTagger = new ChapterTaggingAI()
  if (aiTagger.available && aiPending.length > 0) {
    for (let index = 0; index < aiPending.length; index += MAX_AI_BATCH_SIZE) {
      const batch = aiPending.slice(index, index + MAX_AI_BATCH_SIZE)
      const aiResult = await aiTagger.tagBatch(batch)
      for (const item of batch) {
        const suggestion = aiResult.get(item.questionId)
        if (suggestion?.chapterId) {
          suggestions.set(item.questionId, suggestion)
        }
      }
    }
  }

  for (const question of questions) {
    if (!suggestions.has(question.id)) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: null,
        strategy: 'none',
        confidence: 0,
        reason: aiTagger.available
          ? 'AI 未命中可用章节'
          : '未配置 AI，规则也未命中章节',
      })
    }
  }

  return questions.map((question) => suggestions.get(question.id)!)
}

export async function autoAssignQuestionChapters(
  questions: CreateQuestionInput[]
): Promise<CreateQuestionInput[]> {
  const sourceContextMap = await loadSourceContexts(
    questions
      .map((question) => question.sourceFileId ?? '')
      .filter((value): value is string => Boolean(value))
  )

  const inputs = questions.map((question, index) => ({
    id: `draft-${index}`,
    content: question.content,
    explanation: question.explanation,
    options: question.options,
    answer: question.answer,
    tags: question.tags,
    subjectId: question.subjectId,
    chapterId: question.chapterId,
    source: question.source,
    sourceFileId: question.sourceFileId,
    sourceFile: question.sourceFileId
      ? sourceContextMap.get(question.sourceFileId) ?? null
      : null,
  }))

  const suggestions = await suggestQuestionChapters(inputs)
  const suggestionMap = new Map(
    suggestions.map((suggestion) => [suggestion.questionId, suggestion])
  )

  return questions.map((question, index) => {
    const suggestion = suggestionMap.get(`draft-${index}`)
    if (!suggestion?.chapterId || question.chapterId) {
      return question
    }

    return {
      ...question,
      chapterId: suggestion.chapterId,
    }
  })
}
