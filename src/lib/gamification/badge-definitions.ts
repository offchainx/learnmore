export const BADGE_DEFINITIONS = [
  {
    code: 'first_practice',
    name: 'First Blood',
    description: '完成首次练习提交',
    icon: 'Target',
    condition: '累计提交练习 >= 1',
  },
  {
    code: 'practice_master_100',
    name: 'Practice Master',
    description: '累计正确题数达到 100 题',
    icon: 'Brain',
    condition: '累计答对 >= 100',
  },
  {
    code: 'streak_7_days',
    name: '7-Day Streak',
    description: '连续学习达到 7 天',
    icon: 'Flame',
    condition: 'streak >= 7',
  },
  {
    code: 'community_helper_10',
    name: 'Community Helper',
    description: '社区发帖与评论总计达到 10 次',
    icon: 'MessageSquare',
    condition: 'posts + comments >= 10',
  },
] as const
