import { describe, expect, it } from 'vitest'
import {
  getSecurityActionAuditLevel,
  getSecurityActionRiskLevel,
  isSensitiveSecurityAction,
  summarizeSecurityLogMetadata,
} from '../security-log'

describe('security log helpers', () => {
  it('classifies risk and audit levels consistently for sensitive actions', () => {
    expect(getSecurityActionRiskLevel('USER_BANNED')).toBe('critical')
    expect(getSecurityActionRiskLevel('PASSWORD_RESET')).toBe('high')
    expect(getSecurityActionAuditLevel('USER_BANNED')).toBe('critical')
    expect(getSecurityActionAuditLevel('IMPERSONATE_START')).toBe('warning')
    expect(isSensitiveSecurityAction('PERMISSION_OVERRIDE')).toBe(true)
    expect(isSensitiveSecurityAction('LOGIN')).toBe(false)
  })

  it('summarizes metadata into operator, target, reason and changes', () => {
    const summary = summarizeSecurityLogMetadata({
      operatorName: 'Admin Alice',
      targetEmail: 'student@example.com',
      reason: '违规操作',
      changes: [
        {
          field: 'subscriptionTier',
          before: 'STARTER',
          after: 'PREMIER',
        },
      ],
    })

    expect(summary.operator).toBe('Admin Alice')
    expect(summary.target).toBe('student@example.com')
    expect(summary.reason).toBe('违规操作')
    expect(summary.changes).toEqual(['订阅等级: STARTER → PREMIER'])
  })
})
