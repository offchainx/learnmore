export type ReportsLang = 'en' | 'zh' | 'ms'

type ReportsI18nBundle = {
  header: {
    title: string
    description: string
    export: string
    searchPlaceholder: string
    filter: string
    sort: string
  }
  stats: {
    pendingReports: string
    sinceYesterday: string
    resolvedToday: string
    resolutionRate: string
    avgResolutionTime: string
    hours: string
    fromLastWeek: string
  }
  table: {
    reporter: string
    issueType: string
    questionPreview: string
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
      description: 'Review, track, and resolve content issues reported by students.',
      export: 'Export',
      searchPlaceholder: 'Search reports by ID, content or user...',
      filter: 'Filter',
      sort: 'Sort',
    },
    stats: {
      pendingReports: 'Pending Reports',
      sinceYesterday: '+4 since yesterday',
      resolvedToday: 'Resolved Today',
      resolutionRate: '94% resolution rate',
      avgResolutionTime: 'Avg. Resolution Time',
      hours: 'hrs',
      fromLastWeek: '-15min from last week',
    },
    table: {
      reporter: 'Reporter',
      issueType: 'Issue Type',
      questionPreview: 'Question Preview',
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
      export: '导出',
      searchPlaceholder: '按报错 ID、题目内容或用户搜索...',
      filter: '筛选',
      sort: '排序',
    },
    stats: {
      pendingReports: '待处理报错',
      sinceYesterday: '较昨日 +4',
      resolvedToday: '今日已处理',
      resolutionRate: '处理率 94%',
      avgResolutionTime: '平均处理时长',
      hours: '小时',
      fromLastWeek: '较上周 -15 分钟',
    },
    table: {
      reporter: '上报人',
      issueType: '问题类型',
      questionPreview: '题目预览',
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
      description: 'Semak, jejak dan selesaikan isu kandungan yang dilaporkan pelajar.',
      export: 'Eksport',
      searchPlaceholder: 'Cari laporan mengikut ID, kandungan atau pengguna...',
      filter: 'Tapis',
      sort: 'Susun',
    },
    stats: {
      pendingReports: 'Laporan Tertunggak',
      sinceYesterday: '+4 sejak semalam',
      resolvedToday: 'Selesai Hari Ini',
      resolutionRate: 'Kadar selesai 94%',
      avgResolutionTime: 'Purata Masa Selesai',
      hours: 'jam',
      fromLastWeek: '-15 minit dari minggu lepas',
    },
    table: {
      reporter: 'Pelapor',
      issueType: 'Jenis Isu',
      questionPreview: 'Pratonton Soalan',
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
