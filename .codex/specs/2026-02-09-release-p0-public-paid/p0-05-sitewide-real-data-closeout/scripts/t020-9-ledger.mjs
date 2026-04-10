import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()

function absRef(relativePath) {
  return path.join(ROOT, relativePath)
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absRef(relativePath), 'utf8'))
}

function buildSettingsSection() {
  const summary = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-summary.json'
  )
  const dbSnapshot = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-final-db.json'
  )

  return {
    page: {
      summaryFile: absRef(
        '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-summary.json'
      ),
      screenshotFiles: [
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-off.png'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-restored.png'),
      ],
      summary,
    },
    db: {
      snapshotFile: absRef(
        '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-final-db.json'
      ),
      snapshot: dbSnapshot,
    },
    checks: {
      preferenceRowExists: Boolean(dbSnapshot.prefs),
      emailMarketingAligned:
        dbSnapshot.prefs?.emailMarketing === dbSnapshot.settings?.emailMarketing,
      afterRestoreAligned:
        summary.observations.afterRestore.notificationPreferenceEmailMarketing ===
          dbSnapshot.prefs?.emailMarketing &&
        summary.observations.afterRestore.userSettingsEmailMarketing ===
          dbSnapshot.settings?.emailMarketing,
    },
  }
}

function buildRewardSection() {
  const dbSnapshot = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-db-after.json'
  )

  return {
    page: {
      screenshotFiles: [
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-before.png'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-after.png'),
      ],
      note:
        '本链路页面回显已在 T-020.6 留证，本节引用对应截图与最终 DB 快照做核账。',
    },
    db: {
      snapshotFile: absRef(
        '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-db-after.json'
      ),
      snapshot: dbSnapshot,
    },
    checks: {
      rewardClaimed: dbSnapshot.user?.xp === 50,
      loginTaskClaimed: dbSnapshot.tasks?.[0]?.isClaimed === true,
      relatedDailyTasksPresent: Array.isArray(dbSnapshot.tasks) && dbSnapshot.tasks.length >= 5,
    },
  }
}

function buildSmartDrillSection() {
  const pageSummary = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-ui-summary.json'
  )
  const dbSnapshot = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-final-db.json'
  )

  return {
    page: {
      summaryFile: absRef(
        '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-ui-summary.json'
      ),
      screenshotFiles: [
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-before-submit.png'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-after-submit.png'),
      ],
      summary: pageSummary,
    },
    db: {
      snapshotFile: absRef(
        '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-final-db.json'
      ),
      snapshot: dbSnapshot,
    },
    checks: {
      resultSaved: pageSummary.resultSaved === true,
      completionTitleVisible: pageSummary.containsCompletionTitle === true,
      examCountAligned: dbSnapshot.examCount === 2,
      latestExamAligned:
        dbSnapshot.exams?.[0]?.mode === 'SMART_DRILL' &&
        dbSnapshot.exams?.[0]?.score === 100 &&
        dbSnapshot.exams?.[0]?.totalQuestions === 6,
      quizTaskAligned: dbSnapshot.quizTask?.currentCount === 1,
      growthAligned:
        dbSnapshot.user?.xp === 50 &&
        dbSnapshot.user?.streak === 1 &&
        dbSnapshot.user?.totalStudyTime === 183,
    },
  }
}

function buildFeedbackSection() {
  const resolvedDb = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-db.json'
  )
  const closedDb = readJson(
    '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-db.json'
  )

  return {
    page: {
      screenshotFiles: [
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-before.png'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-after.png'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-before.png'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-after.png'),
      ],
      dbFiles: [
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-db.json'),
        absRef('.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-db.json'),
      ],
      resolvedDb,
      closedDb,
    },
    db: {
      snapshot: closedDb,
    },
    checks: {
      resolvedTransitionObserved:
        resolvedDb.feedback?.status === 'RESOLVED' &&
        resolvedDb.events?.[0]?.eventType === 'STATUS_CHANGED',
      closedTransitionObserved:
        closedDb.feedback?.status === 'CLOSED' &&
        closedDb.events?.some((event) => event.eventType === 'CLOSED') === true,
      eventTrailLength: Array.isArray(closedDb.events) && closedDb.events.length >= 2,
      finalStateClosed: closedDb.feedback?.status === 'CLOSED',
    },
  }
}

function main() {
  const report = {
    capturedAt: new Date().toISOString(),
    sourceMode: 'existing-page-evidence-plus-db-snapshots',
    settings: buildSettingsSection(),
    dashboardReward: buildRewardSection(),
    smartDrill: buildSmartDrillSection(),
    feedback: buildFeedbackSection(),
  }

  console.log(JSON.stringify(report, null, 2))
}

main()
