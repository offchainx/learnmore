import { User, UserStatus, SubscriptionTier, ActivityLog, AuditLogItem, AuditEventType, PaymentRecord, PermissionRecord, ReferralNode } from '../types';

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Cameron', 'Quinn', 'Avery', 'Sarah', 'Michael', 'David', 'Emma', 'Olivia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const DOMAINS = ['gmail.com', 'outlook.com', 'company.io', 'tech.net', 'startup.org'];
const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, DE', 'Remote', 'Toronto, CA', 'Austin, TX'];
const ROLES = ['Student', 'Researcher', 'Teacher', 'Administrator'];
const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Post-Grad'];
const SCHOOLS = ['Lincoln High', 'Tech Academy', 'River Valley School', 'Oak Ridge', 'Summit High', 'Valley View', 'Central College', 'Northside Univ'];

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
  'bg-pink-500', 'bg-rose-500'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRelativeTime(offsetHours: number = 0): { iso: string; label: string } {
  const now = new Date();
  const time = new Date(now.getTime() - (offsetHours * 60 * 60 * 1000) - Math.random() * 10000000);
  
  const diff = now.getTime() - time.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let label = '';
  if (minutes < 60) label = `${minutes} min ago`;
  else if (hours < 24) label = `${hours}h ago`;
  else if (days < 7) label = `${days}d ago`;
  else label = time.toLocaleDateString();

  return { iso: time.toISOString(), label };
}

export const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random()*100)}@${getRandomElement(DOMAINS)}`;
    
    let status = UserStatus.ACTIVE;
    const statusRoll = Math.random();
    if (statusRoll < 0.1) status = UserStatus.BANNED;
    else if (statusRoll < 0.2) status = UserStatus.PAUSED;

    const tier = getRandomElement(Object.values(SubscriptionTier));
    const timeInfo = generateRelativeTime();

    users.push({
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      avatarColor: getRandomElement(COLORS),
      status,
      tier,
      lastActive: timeInfo.iso,
      lastActiveLabel: timeInfo.label,
      grade: getRandomElement(GRADES),
      school: getRandomElement(SCHOOLS),
      role: getRandomElement(ROLES),
      location: getRandomElement(LOCATIONS),
      phone: `+1 (${Math.floor(Math.random()*900)+100}) ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`,
      joinDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
      joinSource: Math.random() > 0.5 ? 'Referral Link' : 'Organic Search',
      totalSpend: Math.floor(Math.random() * 5000),
      projectsCount: Math.floor(Math.random() * 20),
      apiCalls: Math.floor(Math.random() * 100000),
      activeDeviceCount: Math.floor(Math.random() * 3) + 1,
      learningStats: {
        totalQuestions: Math.floor(Math.random() * 500),
        accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
        mistakes: Math.floor(Math.random() * 50),
        daysActive: Math.floor(Math.random() * 60) + 10,
      }
    });
  }
  
  return users.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
};

// --- New Mock Generators for Tab Content ---

export const generatePaymentHistory = (count: number): PaymentRecord[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `pay_${i}`,
    date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    amount: i === count - 1 ? 199 : 29, // Initial higher, monthly lower
    type: i === count - 1 ? 'Initial' : 'Renewal',
    status: Math.random() > 0.95 ? 'Refunded' : 'Success',
  }));
};

export const generateAuditLogs = (): AuditLogItem[] => {
  // Hardcoded to match the specific "Grouping" requirement in prompt
  return [
    {
      id: 'aud_1',
      type: AuditEventType.STATUS,
      title: 'USER_BANNED',
      description: 'Admin: system_bot | Reason: Suspicious API usage spike',
      timestamp: generateRelativeTime(2).iso
    },
    {
      id: 'aud_2',
      type: AuditEventType.IMPERSONATE,
      title: 'IMPERSONATE_END',
      description: 'Reason: Active troubleshooting complete | Duration: 12 min',
      timestamp: generateRelativeTime(5).iso,
      meta: { isSessionEnd: true }
    },
    {
      id: 'aud_3',
      type: AuditEventType.IMPERSONATE,
      title: 'IMPERSONATE_START',
      description: 'Admin: sarah.admin@co.com | Reason: User reported dashboard error',
      timestamp: generateRelativeTime(5.2).iso, // Slightly older than end
      meta: { isSessionStart: true }
    },
    {
      id: 'aud_4',
      type: AuditEventType.PERMISSION,
      title: 'PERMISSION_OVERRIDE',
      description: 'Grant: 7 Days Trial | Reason: Customer support compensation',
      timestamp: generateRelativeTime(24).iso
    },
    {
      id: 'aud_5',
      type: AuditEventType.NOTE,
      title: 'ADMIN_NOTE_ADDED',
      description: 'Admin: mike.support | Content: "User requested refund for May"',
      timestamp: generateRelativeTime(48).iso
    },
    {
      id: 'aud_6',
      type: AuditEventType.LOGIN,
      title: 'LOGIN',
      description: 'IP: 192.168.1.45 | Method: Google OAuth',
      timestamp: generateRelativeTime(72).iso
    }
  ];
};

export const generateReferralTree = (): ReferralNode => {
  return {
    id: 'root',
    name: 'Current User',
    tier: SubscriptionTier.PREMIER,
    children: [
      {
        id: 'ref_1',
        name: 'Alice M.',
        tier: SubscriptionTier.STANDARD,
        children: [
          { id: 'ref_1a', name: 'Bob D.', tier: SubscriptionTier.STARTER }
        ]
      },
      {
        id: 'ref_2',
        name: 'Charlie H.',
        tier: SubscriptionTier.SMART_PLUS,
        children: []
      },
      {
        id: 'ref_3',
        name: 'Diana P.',
        tier: SubscriptionTier.STARTER,
        children: []
      }
    ]
  };
};

export const generateHeatmapData = () => {
  // 12 weeks, 7 days
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      // 0 = none, 1 = low, 2 = medium, 3 = high
      const val = Math.random();
      let intensity = 0;
      if (val > 0.8) intensity = 3;
      else if (val > 0.6) intensity = 2;
      else if (val > 0.3) intensity = 1;
      days.push(intensity);
    }
    weeks.push(days);
  }
  return weeks;
};