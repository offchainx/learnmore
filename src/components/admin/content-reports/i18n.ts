export type ReportsLang = 'en' | 'zh' | 'ms'

type ReportsI18nBundle = {
  header: {
    title: string
    description: string
    badge: string
    range7d: string
    range30d: string
    rangeAll: string
    export: string
    searchPlaceholder: string
    filter: string
    sort: string
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
    pendingReports: string
    sinceYesterday: string
    resolvedToday: string
    resolutionRate: string
    fromLastWeek: string
  }
  filters: {
    queueTitle: string
    queueDescription: string
    searchPlaceholder: string
    statusAll: string
    statusLabel: string
    issueAll: string
    issueLabel: string
    resultSummary: string
    empty: string
  }
  table: {
    selectAll: string
    reporter: string
    issueType: string
    questionPreview: string
    subject: string
    status: string
    actions: string
    bulkActions: string
    bulkSelected: string
    bulkNotePlaceholder: string
    bulkSetReviewing: string
    bulkSetResolved: string
    bulkSetRejected: string
    bulkClear: string
    pending: string
    reviewing: string
    resolved: string
    rejected: string
    viewDetails: string
    showing: string
    to: string
    of: string
    results: string
    page: string
  }
  drawer: {
    reportDetails: string
    reportUnavailable: string
    reportUnavailableHint: string
    topStatus: string
    student: string
    idPrefix: string
    userComment: string
    reportedAt: string
    reporterInfo: string
    reporterIdentity: string
    timelineTitle: string
    workbenchTitle: string
    processedAt: string
    processedBy: string
    processedAction: string
    processedNote: string
    currentStatus: string
    currentStatusLabel: string
    nextStatus: string
    nextStatusPlaceholder: string
    templateLabel: string
    templatePlaceholder: string
    resolutionLabel: string
    resolutionPlaceholder: string
    submitResolution: string
    saving: string
    refresh: string
    noResolution: string
    noTimeline: string
    noWork: string
  }
  issueType: {
    ANSWER_WRONG: string
    TYPO: string
    UNCLEAR: string
    IMAGE_BROKEN: string
    LATEX_ERROR: string
    OTHER: string
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
      export: 'Export',
      searchPlaceholder: 'Search reports...',
      filter: 'Filter',
      sort: 'Sort',
    },
    stats: {
      openQueue: 'Open Reports',
      openQueueHint: 'Pending and reviewing items',
      resolvedInRange: 'Resolved',
      resolvedInRangeHint: 'Closed within current range',
      avgResolutionTime: 'Avg. Resolution Time',
      avgResolutionHint: 'Based on resolved items',
      answerWrong: 'Answer Wrong',
      answerWrongHint: 'Most critical learning impact',
      hours: 'hrs',
      pendingReports: 'Pending Reports',
      sinceYesterday: 'Since yesterday',
      resolvedToday: 'Resolved Today',
      resolutionRate: 'Resolution rate',
      fromLastWeek: 'From last week',
    },
    filters: {
      queueTitle: 'Report Queue',
      queueDescription:
        'Triage student reports, review evidence, and route fixes without leaving the workbench.',
      searchPlaceholder:
        'Search by report ID, question content, subject, reporter, or description...',
      statusAll: 'All Statuses',
      statusLabel: 'Status',
      issueAll: 'All Issues',
      issueLabel: 'Issue Type',
      resultSummary: 'results',
      empty: 'No reports matched the current filters.',
    },
    table: {
      selectAll: 'Select All',
      reporter: 'Reporter',
      issueType: 'Issue Type',
      questionPreview: 'Question Preview',
      subject: 'Subject',
      status: 'Status',
      actions: 'Actions',
      bulkActions: 'Bulk Actions',
      bulkSelected: 'selected',
      bulkNotePlaceholder: 'Optional note for bulk processing...',
      bulkSetReviewing: 'Mark Reviewing',
      bulkSetResolved: 'Mark Resolved',
      bulkSetRejected: 'Mark Rejected',
      bulkClear: 'Clear',
      pending: 'Pending',
      reviewing: 'Reviewing',
      resolved: 'Resolved',
      rejected: 'Rejected',
      viewDetails: 'View Details',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      results: 'results',
      page: 'Page',
    },
    drawer: {
      reportDetails: 'Report Details',
      reportUnavailable: 'Report unavailable',
      reportUnavailableHint:
        'The record may have been filtered out, removed, or you may not have permission to view it.',
      topStatus: 'Top Status',
      student: 'Student',
      idPrefix: 'Ticket ID',
      userComment: 'User Comment',
      reportedAt: 'Reported At',
      reporterInfo: 'Reporter Info',
      reporterIdentity: 'Reporter Identity',
      timelineTitle: 'Processing Timeline',
      workbenchTitle: 'Processing Workbench',
      processedAt: 'Processed At',
      processedBy: 'Processed By',
      processedAction: 'Action',
      processedNote: 'Note',
      currentStatus: 'Current Status',
      currentStatusLabel: 'Current Status',
      nextStatus: 'Next Status',
      nextStatusPlaceholder: 'Choose next status',
      templateLabel: 'Templates',
      templatePlaceholder: 'Choose a template',
      resolutionLabel: 'Processing Note',
      resolutionPlaceholder: 'Write the handling summary, resolution, or rejection reason...',
      submitResolution: 'Submit Resolution',
      saving: 'Saving...',
      refresh: 'Refresh',
      noResolution: 'No resolution yet',
      noTimeline: 'No timeline yet',
      noWork: 'No processing note yet',
    },
    issueType: {
      ANSWER_WRONG: 'Answer Wrong',
      TYPO: 'Typo',
      UNCLEAR: 'Unclear',
      IMAGE_BROKEN: 'Image Broken',
      LATEX_ERROR: 'LaTeX Error',
      OTHER: 'Other',
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
      export: '导出',
      searchPlaceholder: '搜索报错...',
      filter: '筛选',
      sort: '排序',
    },
    stats: {
      openQueue: '待处理报错',
      openQueueHint: '待处理与审核中总量',
      resolvedInRange: '已解决',
      resolvedInRangeHint: '当前时间范围内关闭',
      avgResolutionTime: '平均处理时长',
      avgResolutionHint: '按已解决报错计算',
      answerWrong: '答案错误',
      answerWrongHint: '优先影响学习结果',
      hours: '小时',
      pendingReports: '待处理报错',
      sinceYesterday: '较昨日',
      resolvedToday: '今日已解决',
      resolutionRate: '解决率',
      fromLastWeek: '较上周',
    },
    filters: {
      queueTitle: '报错队列',
      queueDescription:
        '集中处理学员上报问题，快速判断是否需要修题、复审或直接关闭。',
      searchPlaceholder: '按报错 ID、题目内容、科目、上报人或描述搜索...',
      statusAll: '全部状态',
      statusLabel: '状态',
      issueAll: '全部问题',
      issueLabel: '问题类型',
      resultSummary: '条结果',
      empty: '当前筛选条件下没有匹配的报错。',
    },
    table: {
      selectAll: '全选',
      reporter: '上报人',
      issueType: '问题类型',
      questionPreview: '题目预览',
      subject: '科目',
      status: '状态',
      actions: '操作',
      bulkActions: '批量处理',
      bulkSelected: '条已选中',
      bulkNotePlaceholder: '可选：输入批量处理备注...',
      bulkSetReviewing: '批量标记处理中',
      bulkSetResolved: '批量标记已解决',
      bulkSetRejected: '批量标记已驳回',
      bulkClear: '清空选择',
      pending: '待处理',
      reviewing: '审核中',
      resolved: '已解决',
      rejected: '已驳回',
      viewDetails: '查看详情',
      showing: '显示',
      to: '到',
      of: '共',
      results: '条',
      page: '页',
    },
    drawer: {
      reportDetails: '报错详情',
      reportUnavailable: '报错详情不可用',
      reportUnavailableHint:
        '当前记录可能已被筛选移除、已删除，或你没有查看权限。',
      topStatus: '顶部状态',
      student: '学员',
      idPrefix: '工单 ID',
      userComment: '用户反馈',
      reportedAt: '提交时间',
      reporterInfo: '上报人信息',
      reporterIdentity: '上报人身份',
      timelineTitle: '处理时间线',
      workbenchTitle: '处理工作台',
      processedAt: '处理时间',
      processedBy: '处理人',
      processedAction: '动作',
      processedNote: '内容',
      currentStatus: '当前状态',
      currentStatusLabel: '当前状态',
      nextStatus: '下一状态',
      nextStatusPlaceholder: '选择下一状态',
      templateLabel: '模版',
      templatePlaceholder: '选择模版',
      resolutionLabel: '处理说明',
      resolutionPlaceholder: '填写处理结论、解决说明或驳回原因...',
      submitResolution: '提交处理',
      saving: '提交中...',
      refresh: '刷新',
      noResolution: '暂无处理结果',
      noTimeline: '暂无时间线',
      noWork: '暂无处理说明',
    },
    issueType: {
      ANSWER_WRONG: '答案错误',
      TYPO: '文本错误',
      UNCLEAR: '表述不清',
      IMAGE_BROKEN: '图片损坏',
      LATEX_ERROR: '公式错误',
      OTHER: '其他',
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
      export: 'Eksport',
      searchPlaceholder: 'Cari laporan...',
      filter: 'Tapis',
      sort: 'Susun',
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
      pendingReports: 'Laporan Tertunggak',
      sinceYesterday: 'Berbanding semalam',
      resolvedToday: 'Selesai hari ini',
      resolutionRate: 'Kadar penyelesaian',
      fromLastWeek: 'Berbanding minggu lalu',
    },
    filters: {
      queueTitle: 'Barisan Laporan',
      queueDescription:
        'Tumpukan laporan pelajar, semak bukti, dan hantar pembetulan tanpa keluar dari ruang kerja.',
      searchPlaceholder:
        'Cari mengikut ID laporan, kandungan soalan, subjek, pelapor atau deskripsi...',
      statusAll: 'Semua Status',
      statusLabel: 'Status',
      issueAll: 'Semua Isu',
      issueLabel: 'Jenis Isu',
      resultSummary: 'hasil',
      empty: 'Tiada laporan yang sepadan dengan penapis semasa.',
    },
    table: {
      selectAll: 'Pilih Semua',
      reporter: 'Pelapor',
      issueType: 'Jenis Isu',
      questionPreview: 'Pratonton Soalan',
      subject: 'Subjek',
      status: 'Status',
      actions: 'Tindakan',
      bulkActions: 'Tindakan Pukal',
      bulkSelected: 'dipilih',
      bulkNotePlaceholder: 'Nota pilihan untuk pemprosesan pukal...',
      bulkSetReviewing: 'Tanda Sedang Disemak',
      bulkSetResolved: 'Tanda Selesai',
      bulkSetRejected: 'Tanda Ditolak',
      bulkClear: 'Kosongkan',
      pending: 'Tertunggak',
      reviewing: 'Sedang Disemak',
      resolved: 'Selesai',
      rejected: 'Ditolak',
      viewDetails: 'Lihat Butiran',
      showing: 'Menunjukkan',
      to: 'ke',
      of: 'daripada',
      results: 'hasil',
      page: 'Halaman',
    },
    drawer: {
      reportDetails: 'Butiran Laporan',
      reportUnavailable: 'Laporan tidak tersedia',
      reportUnavailableHint:
        'Rekod ini mungkin telah ditapis keluar, dipadam, atau anda tiada kebenaran untuk melihatnya.',
      topStatus: 'Status Atas',
      student: 'Pelajar',
      idPrefix: 'ID Tiket',
      userComment: 'Komen Pengguna',
      reportedAt: 'Dilaporkan Pada',
      reporterInfo: 'Maklumat Pelapor',
      reporterIdentity: 'Identiti Pelapor',
      timelineTitle: 'Garis Masa Pemprosesan',
      workbenchTitle: 'Ruang Kerja Pemprosesan',
      processedAt: 'Diproses Pada',
      processedBy: 'Diproses Oleh',
      processedAction: 'Tindakan',
      processedNote: 'Nota',
      currentStatus: 'Status Semasa',
      currentStatusLabel: 'Status Semasa',
      nextStatus: 'Status Seterusnya',
      nextStatusPlaceholder: 'Pilih status seterusnya',
      templateLabel: 'Templat',
      templatePlaceholder: 'Pilih templat',
      resolutionLabel: 'Nota Pemprosesan',
      resolutionPlaceholder: 'Tulis ringkasan pemprosesan, hasil semakan, atau sebab ditolak...',
      submitResolution: 'Hantar Hasil',
      saving: 'Menyimpan...',
      refresh: 'Muat semula',
      noResolution: 'Belum ada hasil semakan',
      noTimeline: 'Tiada garis masa lagi',
      noWork: 'Belum ada nota pemprosesan',
    },
    issueType: {
      ANSWER_WRONG: 'Jawapan Salah',
      TYPO: 'Ralat Ejaan',
      UNCLEAR: 'Tidak Jelas',
      IMAGE_BROKEN: 'Imej Rosak',
      LATEX_ERROR: 'Ralat LaTeX',
      OTHER: 'Lain-lain',
    },
  },
}

export function getReportsI18n(lang: ReportsLang): ReportsI18nBundle {
  return reportsI18n[lang] ?? reportsI18n.en
}
