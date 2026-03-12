export type ReportsLang = 'en' | 'zh' | 'ms'

type ReportsI18nBundle = {
  header: {
    title: string
    description: string
    badge: string
    range7d: string
    range30d: string
    rangeAll: string
  }
  stats: {
    openQueue: string
    openQueueHint: string
    resolvedInRange: string
    resolvedInRangeHint: string
    avgResolutionTime: string
    avgResolutionHint: string
    answerWrong: string
    answerWrongHint: string
    hours: string
  }
  filters: {
    queueTitle: string
    queueDescription: string
    searchPlaceholder: string
    issueAll: string
    issueLabel: string
    resultSummary: string
    empty: string
  }
  table: {
    reporter: string
    issueType: string
    questionPreview: string
    subject: string
    status: string
    actions: string
    inReview: string
    pending: string
    resolved: string
    viewDetails: string
    showing: string
    to: string
    of: string
    results: string
  }
  drawer: {
    reportDetails: string
    student: string
    idPrefix: string
    userComment: string
    questionContent: string
    systemAnswer: string
    userSuggests: string
    option: string
    confirmErrorRefund: string
    rejectReport: string
    markAsFixed: string
  }
  issueType: {
    ANSWER_WRONG: string
    TYPO_ERROR: string
    IMAGE_MISSING: string
  }
}

const reportsI18n: Record<ReportsLang, ReportsI18nBundle> = {
  en: {
    header: {
      title: 'User Reports Management',
      description:
        'Review, track, and resolve content issues reported by students.',
      badge: 'Report Console',
      range7d: '7 Days',
      range30d: '30 Days',
      rangeAll: 'All Time',
    },
    stats: {
      openQueue: 'Open Reports',
      openQueueHint: 'Pending and in-review items',
      resolvedInRange: 'Resolved',
      resolvedInRangeHint: 'Closed within current range',
      avgResolutionTime: 'Avg. Resolution Time',
      avgResolutionHint: 'Based on resolved items',
      answerWrong: 'Answer Wrong',
      answerWrongHint: 'Most critical learning impact',
      hours: 'hrs',
    },
    filters: {
      queueTitle: 'Report Queue',
      queueDescription:
        'Triage student reports, review evidence, and route fixes without leaving the workbench.',
      searchPlaceholder:
        'Search by report ID, question content, subject or reporter...',
      issueAll: 'All Issues',
      issueLabel: 'Issue Type',
      resultSummary: 'results',
      empty: 'No reports matched the current filters.',
    },
    table: {
      reporter: 'Reporter',
      issueType: 'Issue Type',
      questionPreview: 'Question Preview',
      subject: 'Subject',
      status: 'Status',
      actions: 'Actions',
      inReview: 'In Review',
      pending: 'Pending',
      resolved: 'Resolved',
      viewDetails: 'View Details',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      results: 'results',
    },
    drawer: {
      reportDetails: 'Report Details',
      student: 'Student',
      idPrefix: 'ID',
      userComment: 'User Comment',
      questionContent: 'Question Content',
      systemAnswer: 'System Answer',
      userSuggests: 'User Suggests',
      option: 'Option',
      confirmErrorRefund: 'Confirm Error & Refund',
      rejectReport: 'Reject Report',
      markAsFixed: 'Mark as Fixed',
    },
    issueType: {
      ANSWER_WRONG: 'Answer Wrong',
      TYPO_ERROR: 'Typo Error',
      IMAGE_MISSING: 'Image Missing',
    },
  },
  zh: {
    header: {
      title: '用户报错管理',
      description: '审核、跟踪并处理学员上报的内容问题。',
      badge: 'Report Console',
      range7d: '7 Days',
      range30d: '30 Days',
      rangeAll: 'All Time',
    },
    stats: {
      openQueue: '待处理报错',
      openQueueHint: '待处理与处理中总量',
      resolvedInRange: '已解决',
      resolvedInRangeHint: '当前时间范围内关闭',
      avgResolutionTime: '平均处理时长',
      avgResolutionHint: '按已解决报错计算',
      answerWrong: '答案错误',
      answerWrongHint: '优先影响学习结果',
      hours: '小时',
    },
    filters: {
      queueTitle: '报错队列',
      queueDescription:
        '集中处理学员上报问题，快速判断是否需要修题、复审或直接关闭。',
      searchPlaceholder: '按报错 ID、题目内容、科目或上报人搜索...',
      issueAll: '全部问题',
      issueLabel: '问题类型',
      resultSummary: '条结果',
      empty: '当前筛选条件下没有匹配的报错。',
    },
    table: {
      reporter: '上报人',
      issueType: '问题类型',
      questionPreview: '题目预览',
      subject: '科目',
      status: '状态',
      actions: '操作',
      inReview: '处理中',
      pending: '待处理',
      resolved: '已解决',
      viewDetails: '查看详情',
      showing: '显示',
      to: '到',
      of: '共',
      results: '条',
    },
    drawer: {
      reportDetails: '报错详情',
      student: '学员',
      idPrefix: '编号',
      userComment: '用户反馈',
      questionContent: '题目内容',
      systemAnswer: '系统答案',
      userSuggests: '用户建议',
      option: '选项',
      confirmErrorRefund: '确认题目错误并退款',
      rejectReport: '驳回报错',
      markAsFixed: '标记已修复',
    },
    issueType: {
      ANSWER_WRONG: '答案错误',
      TYPO_ERROR: '文本错误',
      IMAGE_MISSING: '图片缺失',
    },
  },
  ms: {
    header: {
      title: 'Pengurusan Laporan Pengguna',
      description:
        'Semak, jejak dan selesaikan isu kandungan yang dilaporkan pelajar.',
      badge: 'Report Console',
      range7d: '7 Days',
      range30d: '30 Days',
      rangeAll: 'All Time',
    },
    stats: {
      openQueue: 'Laporan Terbuka',
      openQueueHint: 'Tertunggak dan sedang disemak',
      resolvedInRange: 'Selesai',
      resolvedInRangeHint: 'Ditutup dalam julat semasa',
      avgResolutionTime: 'Purata Masa Selesai',
      avgResolutionHint: 'Berdasarkan laporan selesai',
      answerWrong: 'Jawapan Salah',
      answerWrongHint: 'Paling memberi kesan kepada pembelajaran',
      hours: 'jam',
    },
    filters: {
      queueTitle: 'Barisan Laporan',
      queueDescription:
        'Semak isu yang dilaporkan pelajar dan tentukan sama ada perlu dibaiki, disemak semula atau ditutup terus.',
      searchPlaceholder:
        'Cari ikut ID laporan, kandungan soalan, subjek atau pelapor...',
      issueAll: 'Semua Isu',
      issueLabel: 'Jenis Isu',
      resultSummary: 'hasil',
      empty: 'Tiada laporan yang sepadan dengan penapis semasa.',
    },
    table: {
      reporter: 'Pelapor',
      issueType: 'Jenis Isu',
      questionPreview: 'Pratonton Soalan',
      subject: 'Subjek',
      status: 'Status',
      actions: 'Tindakan',
      inReview: 'Dalam Semakan',
      pending: 'Tertunggak',
      resolved: 'Selesai',
      viewDetails: 'Lihat Butiran',
      showing: 'Menunjukkan',
      to: 'hingga',
      of: 'daripada',
      results: 'rekod',
    },
    drawer: {
      reportDetails: 'Butiran Laporan',
      student: 'Pelajar',
      idPrefix: 'ID',
      userComment: 'Komen Pengguna',
      questionContent: 'Kandungan Soalan',
      systemAnswer: 'Jawapan Sistem',
      userSuggests: 'Cadangan Pengguna',
      option: 'Pilihan',
      confirmErrorRefund: 'Sahkan Ralat & Bayaran Balik',
      rejectReport: 'Tolak Laporan',
      markAsFixed: 'Tanda Selesai',
    },
    issueType: {
      ANSWER_WRONG: 'Jawapan Salah',
      TYPO_ERROR: 'Ralat Ejaan',
      IMAGE_MISSING: 'Imej Tiada',
    },
  },
}

export function getReportsI18n(lang: ReportsLang): ReportsI18nBundle {
  return reportsI18n[lang] ?? reportsI18n.en
}
