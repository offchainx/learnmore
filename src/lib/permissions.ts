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

const ROLE_PERMISSIONS: Partial<Record<UserRole, Permission[]>> = {
  [UserRole.STUDENT]: [
    'access:basic_content',
    'limit:ai_chats_5',
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
  ],
  [UserRole.PARENT]: [
    'access:parent_app',
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export function canAccessFeature(role: UserRole, featureLevel: 'free' | 'pro' | 'ultimate'): boolean {
    if (featureLevel === 'free') return true;
    if (featureLevel === 'pro') return role === UserRole.TEACHER || role === UserRole.ADMIN;
    if (featureLevel === 'ultimate') return role === UserRole.ADMIN;
    return false;
}