import { Reviewer, StatItem, SubjectData, DifficultyData } from './types';

export const REVIEWERS: Reviewer[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgjAFZfGJVqjTa3TloM0WBLOe-24eV8-OZWROzpIeBLQQsLtTCt2CflZdBBfrb6ZVelL1ZbczQLkS0FplSxuoA7tiC0ABsIYQZuclPaTj1AKuL8CazD3yweIHeS45hLdGsHztaBXxAfy6c8q-mDsEDxd99o0kboBXBp3vUGpDY5mzt_IGX4DmzeVjPSKYsZmdWoN00yzyEIRoXS5tuU3zXhQvsywkcg7wVtNSlfIbUoVdrz3w7GfefdhLAN1OJntWlCkJH7PAHBWg',
    role: 'Senior Editor',
    reviews: 1245,
    accuracy: 98,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Mike Ross',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqyY8ZniT0wqYtjualV9tHClQAXULIqFO_Vu3Vl9G7AccNzmGoHNTyjCVJxLkmoN8e-yFCKNbQopXdjTWY1uJoj-BYyRU7cAmGR8WtWYhepZxd8hlkztJlAjWvqlDNicvepPFOxwhTSBMFqKqFYCXiJH4JN0oyTN7AFpferS9NsIU6AaGG0fcu0txoEaZHc4s1C7Qe0HZsx7a2VbFOcWJHvJbV9hnQVJy9kYnPSA6TT6hEQ64s160FvocKh61-kYycxiyRXc9rsE',
    role: 'Subject Expert',
    reviews: 892,
    accuracy: 94,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Jessica Pearson',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJdxPTPPSjzeecMIH6ZnVOROsZ6MOfPkcL-KViMGnNj6Dj3VZcZnFhdFySJnq1vSEU00Oq9pYwsOTQDPJU_MlraVhYwXGiaiSCifLeKGBgfzDPI35Jx7iFM3UOrYxXbzCre1tvQYuNzshMDXbL__CqB-6JglRyn4igGVn5gkCMyVrRsXNOqdFNVls-J4ZPx5Rlqi3AuC4u5yChQRXlw994jSbby7rQNlBGdpXQckge4ueRL2_4GgCi8lSoKwtw7NdU0x3XlgSfcTM',
    role: 'Reviewer',
    reviews: 654,
    accuracy: 88,
    status: 'Away',
  },
  {
    id: '4',
    name: 'Louis Litt',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzeYoR-twV7fD_AHN3IwaCb0C4xVnLV_Ak7tIXBiVTbftcEiK8WT3nrjd_bG_fX3E4NaB_pwd9XjnSkSjrDZdIBkI9NeE9URE838KMIkDVeUM4OhEW9kb7DAtK5dGviDckqxma3kj1Rc0oQ2poLLVr4CGlS7SuvC4QYJUBgvSkfHik9uQPkKwDwYf2vRR-FMyJE4XQv1pAAbcmPCXtwlK41exAMMMbzzUl4tG2PNvQ-9rUN3r_JKPLqzqEF3OXtP78CMyGWPY5_iw',
    role: 'QA Lead',
    reviews: 541,
    accuracy: 96,
    status: 'Active',
  },
  {
    id: '5',
    name: 'Harvey Specter',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1zw7OjNTLO0tBxk02YnGq3R2m06Xh1tj39m0GubyDlMO4Y9U7mkdSg5y5bCWHAQw4htYnbODXKvfHxqtH-BYxm42Y6kQs_yCR3YPsNP8xSWbwhgj4y_B8FIW6q9apjMHG2F5-W-SA5jBuDw7w7p85-5n7ggzLbHatCwSzyR7nqlINwGv7Ul1UFP4msqvy67And2nKPJHd0Nu2M_LZsdKACQdjT_hN35HGSVAlYgqiojjJDc0MtbXjlQGv2E9fvsJmCyM0L67_7Es',
    role: 'Content Mgr',
    reviews: 432,
    accuracy: 99,
    status: 'Offline',
  },
];

export const STATS: StatItem[] = [
  {
    id: '1',
    title: 'Total Questions',
    value: '12,450',
    icon: 'quiz',
    color: 'blue',
    trend: {
      value: '+8.2%',
      isPositive: true,
      text: 'from last week'
    }
  },
  {
    id: '2',
    title: 'Published',
    value: '9,820',
    icon: 'check_circle',
    color: 'green',
    progress: 78,
    description: '78% Completion rate'
  },
  {
    id: '3',
    title: 'Pending Review',
    value: '1,842',
    icon: 'hourglass_empty',
    color: 'orange',
    trend: {
      value: 'Needs attention',
      isPositive: false,
      text: ''
    }
  },
  {
    id: '4',
    title: 'Approval Rate',
    value: '92%',
    icon: 'verified',
    color: 'purple',
    description: 'High quality standard',
    isCircular: true
  }
];

export const SUBJECT_DATA: SubjectData[] = [
  { subject: 'Math', value: 85, fullMark: 100 },
  { subject: 'Physics', value: 65, fullMark: 100 },
  { subject: 'Chem', value: 45, fullMark: 100 },
  { subject: 'English', value: 30, fullMark: 100 },
  { subject: 'Bio', value: 72, fullMark: 100 },
];

export const DIFFICULTY_DATA: DifficultyData[] = [
  { name: 'Easy', value: 5625, color: '#10B981', percentage: 45, total: 12500 },
  { name: 'Medium', value: 3735, color: '#F59E0B', percentage: 30, total: 12500 },
  { name: 'Hard', value: 3112, color: '#EF4444', percentage: 25, total: 12500 },
];