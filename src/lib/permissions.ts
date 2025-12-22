import { UserRole } from '@prisma/client';

export type Permission = 
  | 'access:basic_content'
  | 'access:hd_video'
  | 'access:full_question_bank'
  | 'access:knowledge_graph'
  | 'access:olympiad_questions'
  | 'access:parent_app'
  | 'limit:ai_chats_5'
  | 'limit:ai_chats_20'
  | 'limit:ai_chats_100'
  | 'limit:ai_chats_unlimited';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    'access:basic_content',
    'limit:ai_chats_5',
  ],
  [UserRole.PRO]: [
    'access:basic_content',
    'access:hd_video',
    'access:full_question_bank',
    'limit:ai_chats_20',
  ],
  [UserRole.ULTIMATE]: [
    'access:basic_content',
    'access:hd_video',
    'access:full_question_bank',
    'access:knowledge_graph',
    'access:olympiad_questions',
    'access:parent_app',
    'limit:ai_chats_unlimited',
  ],
  [UserRole.TEACHER]: [
    'access:basic_content',
    'access:hd_video',
    'access:full_question_bank',
    'access:knowledge_graph',
    'access:olympiad_questions',
    'limit:ai_chats_unlimited',
  ],
  [UserRole.ADMIN]: [
    'access:basic_content',
    'access:hd_video',
    'access:full_question_bank',
    'access:knowledge_graph',
    'access:olympiad_questions',
    'access:parent_app',
    'limit:ai_chats_unlimited',
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export function canAccessFeature(role: UserRole, featureLevel: 'free' | 'pro' | 'ultimate'): boolean {
    if (featureLevel === 'free') return true;
    if (featureLevel === 'pro') return role === UserRole.PRO || role === UserRole.ULTIMATE || role === UserRole.TEACHER || role === UserRole.ADMIN;
    if (featureLevel === 'ultimate') return role === UserRole.ULTIMATE || role === UserRole.ADMIN;
    return false;
}
