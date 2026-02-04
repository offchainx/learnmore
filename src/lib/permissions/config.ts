import { FeatureKey, PermissionMatrix, TierKey } from './types';

export const TIER_CONFIG: PermissionMatrix = {
  STARTER: [
    'basic_quiz', 
    'analytics_basic'
  ],
  STANDARD: [
    'basic_quiz', 
    'analytics_basic',
    'error_book', 
    'download_resources'
  ],
  SMART_PLUS: [
    'basic_quiz', 
    'analytics_basic',
    'error_book', 
    'download_resources',
    'smart_drill', 
    'ai_tutor'
  ],
  PREMIER: [
    'basic_quiz', 
    'analytics_basic',
    'error_book', 
    'download_resources',
    'smart_drill', 
    'ai_tutor',
    'mock_exam', 
    'analytics_advanced'
  ],
};

export const DEFAULT_TIER: TierKey = 'STARTER';
