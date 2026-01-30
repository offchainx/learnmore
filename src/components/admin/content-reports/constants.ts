import { Report, ReportStatus, IssueType } from './types';

export const MOCK_REPORTS: Report[] = [
  {
    id: 'R-8823',
    user: {
      id: 'u1',
      name: 'Sarah Jenkins',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBELasUW8C45-IUlDe_7xeOctLZ3Kt1Yh1xjI70tYiq-gOxBUFD81j9suJF3mkS6o7myPFCSRg3Mg7z1lyxgOyK5El3QQwvIoMfWHzb2GlhdVFULKbvMiLrD0lMMvaGkE31flMZVYSHkvp_Qg1z1jXiy-7JuTJuH70kOyxIdSq80EJcXg6TCQqpwwF5M8v3ed09d68bwXEDjJQgQ58oX51S1e9V1A3NoWeEGZk9U6Tz0qqrMc03fAL4heG49bSRXXVoY0ITY4w7d1zG'
    },
    timestamp: '2 mins ago',
    issueType: IssueType.ANSWER_WRONG,
    status: ReportStatus.IN_REVIEW,
    comment: "The correct answer should be Heisenberg's Uncertainty Principle, but the system marked 'B' as correct which is Pauli Exclusion Principle.",
    systemCorrectOptionId: 'B',
    userSuggestedOptionId: 'A',
    question: {
      id: 'Q-8823',
      subject: 'Physics 101',
      text: 'In quantum mechanics, which principle states that position and momentum cannot be simultaneously measured with arbitrarily high precision?',
      options: [
        { id: 'A', text: "Heisenberg's Uncertainty Principle", isCorrect: false },
        { id: 'B', text: "Pauli Exclusion Principle", isCorrect: true },
        { id: 'C', text: "Schrödinger's Cat Paradox", isCorrect: false },
        { id: 'D', text: "Planck's Constant", isCorrect: false },
      ]
    }
  },
  {
    id: 'R-4129',
    user: {
      id: 'u2',
      name: 'David Kim',
      avatar: ''
    },
    timestamp: '15 mins ago',
    issueType: IssueType.TYPO_ERROR,
    status: ReportStatus.PENDING,
    comment: "Spelling mistake in the question text.",
    question: {
      id: 'Q-4129',
      subject: 'Biology 201',
      text: 'The mitochondria is the powerhouse of the cell, responsible for...',
      options: [
        { id: 'A', text: "Respiration", isCorrect: true },
        { id: 'B', text: "Digestion", isCorrect: false },
      ]
    }
  },
  {
    id: 'R-9932',
    user: {
      id: 'u3',
      name: 'Marcus Reid',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOzNeyN7ofxWwh-WFsvvZVjYlpy56wQBAD8p9wnRHxTArwsZWy8ZRACObTNHcpB7HlRGfmJEcRi0DCHQ5aGdaOObvfsLlmwOOwQ_pzqMOv8wlL-LcWGxsty5zQCKv_wXOZdA0INArm54YrYFYj4A_8U0fxUXnIj4k1K4L0EEvP7QANHqOE3qm_OEej6nrMXa-jySHzsUrw3PQav5mJv-4RVxRzOMr07-0JoMnrSgiSd6ZMPdM4BGCkrtyuhNPFghaDGz-cN6XLKkFl'
    },
    timestamp: '1 hour ago',
    issueType: IssueType.IMAGE_MISSING,
    status: ReportStatus.RESOLVED,
    comment: "Diagram is not loading.",
    question: {
      id: 'Q-9932',
      subject: 'Geometry',
      text: 'Calculate the area of the shaded region in the following diagram...',
      options: []
    }
  },
  {
    id: 'R-1120',
    user: {
      id: 'u4',
      name: 'Elena Lopez',
      avatar: ''
    },
    timestamp: '3 hours ago',
    issueType: IssueType.ANSWER_WRONG,
    status: ReportStatus.PENDING,
    comment: "I think Blue is primary.",
    question: {
      id: 'Q-1120',
      subject: 'Art History',
      text: 'Which of the following is NOT a primary color in the additive model?',
      options: []
    }
  }
];
