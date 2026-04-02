export type ReportsRange = '7d' | '30d' | 'all'

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'

export type ReportIssueType =
  | 'ANSWER_WRONG'
  | 'TYPO'
  | 'UNCLEAR'
  | 'IMAGE_BROKEN'
  | 'LATEX_ERROR'
  | 'OTHER'

export interface ReportsReporter {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
}

export interface ReportQuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface ReportsQuestion {
  id: string
  content: string
  type: string
  subject: string
  options: ReportQuestionOption[]
  answer: string[]
}

export interface ReportRecord {
  id: string
  reporter: ReportsReporter
  question: ReportsQuestion
  issueType: ReportIssueType
  status: ReportStatus
  description: string
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  resolution: string | null
}

export interface ReportsOverview {
  openQueue: number
  resolvedCount: number
  avgResolutionTime: number
  answerWrongCount: number
}

