import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

type ShellBox = {
  key: string
  x: number
  y: number
  width: number
  height: number
  className: string
}

type HeroArtFrame = {
  x: number
  y: number
  width: number
  height: number
}

type HeroCtaOffset = {
  x: number
  y: number
}

type ProfileAvatarTransform = {
  x: number
  y: number
  scale: number
}

type PathBackgroundOffset = {
  y: number
}

type ProfileSectionKey = 'avatar' | 'greeting' | 'stats' | 'badge'

type ProfileSectionBox = {
  x: number
  y: number
  width: number
  height: number
}

type ProfileSectionBoxes = Record<ProfileSectionKey, ProfileSectionBox>

type ReviewCardKey = 'math' | 'science' | 'english' | 'social'

type ReviewCardBox = {
  x: number
  y: number
  width: number
  height: number
}

type ReviewCardBoxes = Record<ReviewCardKey, ReviewCardBox>

type TaskCardKey = 'math' | 'science' | 'english' | 'bonus'

type TaskCardBox = {
  x: number
  y: number
  width: number
  height: number
}

type TaskCardBoxes = Record<TaskCardKey, TaskCardBox>

type EditableTitleTransform = {
  x: number
  y: number
  scale: number
}

type TimeStudyPanelKey = 'pie' | 'stats'

type TimeStudyPanelBox = {
  x: number
  y: number
  width: number
  height: number
}

type TimeStudyPanelBoxes = Record<TimeStudyPanelKey, TimeStudyPanelBox>

type SubjectCardKey = 'math' | 'science' | 'chinese' | 'geography'

type SubjectCardBox = {
  x: number
  y: number
  width: number
  height: number
}

type SubjectCardBoxes = Record<SubjectCardKey, SubjectCardBox>

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeShellBoxes(input: unknown): ShellBox[] | null {
  if (!Array.isArray(input)) {
    return null
  }

  const normalized = input
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const candidate = item as Partial<ShellBox>
      if (
        typeof candidate.key !== 'string' ||
        !isFiniteNumber(candidate.x) ||
        !isFiniteNumber(candidate.y) ||
        !isFiniteNumber(candidate.width) ||
        !isFiniteNumber(candidate.height)
      ) {
        return null
      }

      return {
        key: candidate.key,
        x: Number(candidate.x.toFixed(3)),
        y: Number(candidate.y.toFixed(3)),
        width: Number(candidate.width.toFixed(3)),
        height: Number(candidate.height.toFixed(3)),
        className: typeof candidate.className === 'string' ? candidate.className : '',
      }
    })
    .filter((item): item is ShellBox => item !== null)

  return normalized.length > 0 ? normalized : null
}

function normalizeHeroArtFrame(input: unknown): HeroArtFrame | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<HeroArtFrame>
  if (
    !isFiniteNumber(candidate.x) ||
    !isFiniteNumber(candidate.y) ||
    !isFiniteNumber(candidate.width) ||
    !isFiniteNumber(candidate.height)
  ) {
    return null
  }

  return {
    x: Number(candidate.x.toFixed(3)),
    y: Number(candidate.y.toFixed(3)),
    width: Number(candidate.width.toFixed(3)),
    height: Number(candidate.height.toFixed(3)),
  }
}

function normalizeHeroCtaOffset(input: unknown): HeroCtaOffset | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<HeroCtaOffset>
  if (!isFiniteNumber(candidate.x) || !isFiniteNumber(candidate.y)) {
    return null
  }

  return {
    x: Number(candidate.x.toFixed(3)),
    y: Number(candidate.y.toFixed(3)),
  }
}

function normalizeProfileAvatarTransform(input: unknown): ProfileAvatarTransform | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<ProfileAvatarTransform>
  if (
    !isFiniteNumber(candidate.x) ||
    !isFiniteNumber(candidate.y) ||
    !isFiniteNumber(candidate.scale)
  ) {
    return null
  }

  return {
    x: Number(candidate.x.toFixed(3)),
    y: Number(candidate.y.toFixed(3)),
    scale: Number(candidate.scale.toFixed(3)),
  }
}

function normalizePathBackgroundOffset(input: unknown): PathBackgroundOffset | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<PathBackgroundOffset>

  return {
    y: typeof candidate.y === 'number' ? Number(candidate.y.toFixed(3)) : 0,
  }
}

function normalizeProfileSectionBoxes(input: unknown): ProfileSectionBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<ProfileSectionKey, Partial<ProfileSectionBox>>>
  const normalizeSection = (key: ProfileSectionKey) => {
    const section = candidate[key]
    const base = {
      avatar: { x: 0, y: 0, width: 150, height: 112 },
      greeting: { x: 150, y: 34, width: 290, height: 82 },
      stats: { x: 455, y: 32, width: 236, height: 84 },
      badge: { x: 705, y: 25, width: 72, height: 94 },
    }[key]
    if (!section) {
      return base
    }

    return {
      x: isFiniteNumber(section.x) ? Number(section.x.toFixed(3)) : base.x,
      y: isFiniteNumber(section.y) ? Number(section.y.toFixed(3)) : base.y,
      width: isFiniteNumber(section.width)
        ? Number(Math.max(44, section.width).toFixed(3))
        : base.width,
      height: isFiniteNumber(section.height)
        ? Number(Math.max(44, section.height).toFixed(3))
        : base.height,
    }
  }

  return {
    avatar: normalizeSection('avatar'),
    greeting: normalizeSection('greeting'),
    stats: normalizeSection('stats'),
    badge: normalizeSection('badge'),
  }
}

function normalizeReviewCardBoxes(input: unknown): ReviewCardBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<ReviewCardKey, Partial<ReviewCardBox>>>
  const result = {} as ReviewCardBoxes

  for (const key of ['math', 'science', 'english', 'social'] as const) {
    const card = candidate[key]
    const base = {
      math: { x: 0, y: 0, width: 185, height: 154 },
      science: { x: 195, y: 0, width: 185, height: 154 },
      english: { x: 390, y: 0, width: 185, height: 154 },
      social: { x: 585, y: 0, width: 185, height: 154 },
    }[key]

    result[key] = {
      x: isFiniteNumber(card?.x) ? Number(card.x.toFixed(3)) : base.x,
      y: isFiniteNumber(card?.y) ? Number(card.y.toFixed(3)) : base.y,
      width: isFiniteNumber(card?.width)
        ? Number(Math.max(96, card.width).toFixed(3))
        : base.width,
      height: isFiniteNumber(card?.height)
        ? Number(Math.max(88, card.height).toFixed(3))
        : base.height,
    }
  }

  return result
}

function normalizeTaskCardBoxes(input: unknown): TaskCardBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<TaskCardKey, Partial<TaskCardBox>>>
  const base = {
    math: { x: 0, y: 0, width: 250, height: 128 },
    science: { x: 265, y: 0, width: 250, height: 128 },
    english: { x: 530, y: 0, width: 250, height: 128 },
    bonus: { x: 795, y: 0, width: 250, height: 128 },
  }

  const result = {} as TaskCardBoxes

  for (const key of ['math', 'science', 'english', 'bonus'] as const) {
    const card = candidate[key]
    const fallback = base[key]
    result[key] = {
      x: isFiniteNumber(card?.x) ? Number(card.x.toFixed(3)) : fallback.x,
      y: isFiniteNumber(card?.y) ? Number(card.y.toFixed(3)) : fallback.y,
      width: isFiniteNumber(card?.width)
        ? Number(Math.max(120, card.width).toFixed(3))
        : fallback.width,
      height: isFiniteNumber(card?.height)
        ? Number(Math.max(96, card.height).toFixed(3))
        : fallback.height,
    }
  }

  return result
}

function normalizeEditableTitleTransform(input: unknown): EditableTitleTransform | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<EditableTitleTransform>
  if (
    !isFiniteNumber(candidate.x) ||
    !isFiniteNumber(candidate.y) ||
    !isFiniteNumber(candidate.scale)
  ) {
    return null
  }

  return {
    x: Number(candidate.x.toFixed(3)),
    y: Number(candidate.y.toFixed(3)),
    scale: Number(candidate.scale.toFixed(3)),
  }
}

function normalizeTimeStudyPanelBoxes(input: unknown): TimeStudyPanelBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<TimeStudyPanelKey, Partial<TimeStudyPanelBox>>>
  const base = {
    pie: { x: 0, y: 0, width: 138, height: 138 },
    stats: { x: 148, y: 0, width: 224, height: 138 },
  }

  const result = {} as TimeStudyPanelBoxes

  for (const key of ['pie', 'stats'] as const) {
    const panel = candidate[key]
    const fallback = base[key]
    result[key] = {
      x: isFiniteNumber(panel?.x) ? Number(panel.x.toFixed(3)) : fallback.x,
      y: isFiniteNumber(panel?.y) ? Number(panel.y.toFixed(3)) : fallback.y,
      width: isFiniteNumber(panel?.width)
        ? Number(Math.max(112, panel.width).toFixed(3))
        : fallback.width,
      height: isFiniteNumber(panel?.height)
        ? Number(Math.max(112, panel.height).toFixed(3))
        : fallback.height,
    }
  }

  return result
}

function normalizeSubjectCardBoxes(input: unknown): SubjectCardBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<SubjectCardKey, Partial<SubjectCardBox>>>
  const base = {
    math: { x: 20, y: 0, width: 168, height: 84 },
    science: { x: 208, y: 0, width: 168, height: 84 },
    chinese: { x: 20, y: 104, width: 168, height: 84 },
    geography: { x: 208, y: 104, width: 168, height: 84 },
  }

  const result = {} as SubjectCardBoxes

  for (const key of ['math', 'science', 'chinese', 'geography'] as const) {
    const card = candidate[key]
    const fallback = base[key]
    result[key] = {
      x: isFiniteNumber(card?.x) ? Number(card.x.toFixed(3)) : fallback.x,
      y: isFiniteNumber(card?.y) ? Number(card.y.toFixed(3)) : fallback.y,
      width: isFiniteNumber(card?.width)
        ? Number(Math.max(110, card.width).toFixed(3))
        : fallback.width,
      height: isFiniteNumber(card?.height)
        ? Number(Math.max(70, card.height).toFixed(3))
        : fallback.height,
    }
  }

  return result
}

function diffShellBoxes(current: ShellBox[], baseline: ShellBox[]) {
  const baselineByKey = new Map(baseline.map((box) => [box.key, box]))

  return current.map((box) => {
    const base = baselineByKey.get(box.key)
    return {
      key: box.key,
      dx: Number((box.x - (base?.x ?? 0)).toFixed(3)),
      dy: Number((box.y - (base?.y ?? 0)).toFixed(3)),
      dWidth: Number((box.width - (base?.width ?? 0)).toFixed(3)),
      dHeight: Number((box.height - (base?.height ?? 0)).toFixed(3)),
    }
  })
}

function diffBox(
  current: { x: number; y: number; width: number; height: number },
  baseline: { x: number; y: number; width: number; height: number }
) {
  return {
    x: Number((current.x - baseline.x).toFixed(3)),
    y: Number((current.y - baseline.y).toFixed(3)),
    width: Number((current.width - baseline.width).toFixed(3)),
    height: Number((current.height - baseline.height).toFixed(3)),
  }
}

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as {
      shellBoxes?: unknown
      shellCornerRadius?: unknown
      heroArtFrame?: unknown
      heroCtaOffset?: unknown
      profileAvatarTransform?: unknown
      profileSectionBoxes?: unknown
      streakTitleTransform?: unknown
      streakCampfireFrame?: unknown
      pathBackgroundOffset?: unknown
      reviewCardBoxes?: unknown
      timeTitleTransform?: unknown
      timeStudyPanelBoxes?: unknown
      taskTitleTransform?: unknown
      taskCardBoxes?: unknown
      subjectTitleTransform?: unknown
      subjectCardBoxes?: unknown
      reviewTitleTransform?: unknown
      pathTitleTransform?: unknown
      baseline?: {
        shellBoxes?: unknown
        shellCornerRadius?: unknown
        heroArtFrame?: unknown
        heroCtaOffset?: unknown
        profileAvatarTransform?: unknown
        profileSectionBoxes?: unknown
        streakTitleTransform?: unknown
        streakCampfireFrame?: unknown
        pathBackgroundOffset?: unknown
        reviewCardBoxes?: unknown
        timeTitleTransform?: unknown
        timeStudyPanelBoxes?: unknown
        taskTitleTransform?: unknown
        taskCardBoxes?: unknown
        subjectTitleTransform?: unknown
        subjectCardBoxes?: unknown
        reviewTitleTransform?: unknown
        pathTitleTransform?: unknown
      }
    }

    const shellBoxes = normalizeShellBoxes(body.shellBoxes)
    const baselineShellBoxes = normalizeShellBoxes(body.baseline?.shellBoxes)
    const heroArtFrame = normalizeHeroArtFrame(body.heroArtFrame)
    const baselineHeroArtFrame = normalizeHeroArtFrame(body.baseline?.heroArtFrame)
    const heroCtaOffset = normalizeHeroCtaOffset(body.heroCtaOffset)
    const baselineHeroCtaOffset = normalizeHeroCtaOffset(body.baseline?.heroCtaOffset)
    const profileAvatarTransform = normalizeProfileAvatarTransform(body.profileAvatarTransform)
    const baselineProfileAvatarTransform = normalizeProfileAvatarTransform(
      body.baseline?.profileAvatarTransform
    )
    const profileSectionBoxes = normalizeProfileSectionBoxes(body.profileSectionBoxes)
    const baselineProfileSectionBoxes = normalizeProfileSectionBoxes(
      body.baseline?.profileSectionBoxes
    )
    const streakTitleTransform = normalizeEditableTitleTransform(body.streakTitleTransform)
    const baselineStreakTitleTransform = normalizeEditableTitleTransform(
      body.baseline?.streakTitleTransform
    )
    const streakCampfireFrame = normalizeHeroArtFrame(body.streakCampfireFrame)
    const baselineStreakCampfireFrame = normalizeHeroArtFrame(
      body.baseline?.streakCampfireFrame
    )
    const pathBackgroundOffset = normalizePathBackgroundOffset(body.pathBackgroundOffset)
    const baselinePathBackgroundOffset = normalizePathBackgroundOffset(
      body.baseline?.pathBackgroundOffset
    )
    const reviewCardBoxes = normalizeReviewCardBoxes(body.reviewCardBoxes)
    const baselineReviewCardBoxes = normalizeReviewCardBoxes(body.baseline?.reviewCardBoxes)
    const timeTitleTransform = normalizeEditableTitleTransform(body.timeTitleTransform)
    const baselineTimeTitleTransform = normalizeEditableTitleTransform(
      body.baseline?.timeTitleTransform
    )
    const timeStudyPanelBoxes = normalizeTimeStudyPanelBoxes(body.timeStudyPanelBoxes)
    const baselineTimeStudyPanelBoxes = normalizeTimeStudyPanelBoxes(
      body.baseline?.timeStudyPanelBoxes
    )
    const taskTitleTransform = normalizeEditableTitleTransform(body.taskTitleTransform)
    const baselineTaskTitleTransform = normalizeEditableTitleTransform(
      body.baseline?.taskTitleTransform
    )
    const taskCardBoxes = normalizeTaskCardBoxes(body.taskCardBoxes)
    const baselineTaskCardBoxes = normalizeTaskCardBoxes(body.baseline?.taskCardBoxes)
    const subjectTitleTransform = normalizeEditableTitleTransform(body.subjectTitleTransform)
    const baselineSubjectTitleTransform = normalizeEditableTitleTransform(
      body.baseline?.subjectTitleTransform
    )
    const subjectCardBoxes = normalizeSubjectCardBoxes(body.subjectCardBoxes)
    const baselineSubjectCardBoxes = normalizeSubjectCardBoxes(body.baseline?.subjectCardBoxes)
    const reviewTitleTransform = normalizeEditableTitleTransform(body.reviewTitleTransform)
    const baselineReviewTitleTransform = normalizeEditableTitleTransform(
      body.baseline?.reviewTitleTransform
    )
    const pathTitleTransform = normalizeEditableTitleTransform(body.pathTitleTransform)
    const baselinePathTitleTransform = normalizeEditableTitleTransform(
      body.baseline?.pathTitleTransform
    )
    const shellCornerRadius = isFiniteNumber(body.shellCornerRadius)
      ? Number(body.shellCornerRadius.toFixed(3))
      : null
    const baselineShellCornerRadius = isFiniteNumber(body.baseline?.shellCornerRadius)
      ? Number(body.baseline.shellCornerRadius.toFixed(3))
      : null

    if (
      !shellBoxes ||
      !baselineShellBoxes ||
      heroArtFrame === null ||
      baselineHeroArtFrame === null ||
      heroCtaOffset === null ||
      baselineHeroCtaOffset === null ||
      profileAvatarTransform === null ||
      baselineProfileAvatarTransform === null ||
      profileSectionBoxes === null ||
      baselineProfileSectionBoxes === null ||
      streakTitleTransform === null ||
      baselineStreakTitleTransform === null ||
      streakCampfireFrame === null ||
      baselineStreakCampfireFrame === null ||
      pathBackgroundOffset === null ||
      baselinePathBackgroundOffset === null ||
      reviewCardBoxes === null ||
      baselineReviewCardBoxes === null ||
      timeTitleTransform === null ||
      baselineTimeTitleTransform === null ||
      timeStudyPanelBoxes === null ||
      baselineTimeStudyPanelBoxes === null ||
      taskTitleTransform === null ||
      baselineTaskTitleTransform === null ||
      taskCardBoxes === null ||
      baselineTaskCardBoxes === null ||
      subjectTitleTransform === null ||
      baselineSubjectTitleTransform === null ||
      subjectCardBoxes === null ||
      baselineSubjectCardBoxes === null ||
      reviewTitleTransform === null ||
      baselineReviewTitleTransform === null ||
      pathTitleTransform === null ||
      baselinePathTitleTransform === null ||
      shellCornerRadius === null ||
      baselineShellCornerRadius === null
    ) {
      return NextResponse.json({ error: 'Invalid page snapshot payload' }, { status: 400 })
    }

    const artifactDir = path.join(
      process.cwd(),
      '.codex',
      'artifacts',
      'page-freeze'
    )
    const artifactPath = path.join(artifactDir, 'latest-page-snapshot.json')

    const payload = {
      savedAt: new Date().toISOString(),
      shellCornerRadius,
      shellBoxes,
      heroArtFrame,
      heroCtaOffset,
      profileAvatarTransform,
      profileSectionBoxes,
      streakTitleTransform,
      streakCampfireFrame,
      pathBackgroundOffset,
      reviewCardBoxes,
      timeTitleTransform,
      timeStudyPanelBoxes,
      taskTitleTransform,
      taskCardBoxes,
      subjectTitleTransform,
      subjectCardBoxes,
      reviewTitleTransform,
      pathTitleTransform,
      baseline: {
        shellCornerRadius: baselineShellCornerRadius,
        shellBoxes: baselineShellBoxes,
        heroArtFrame: baselineHeroArtFrame,
        heroCtaOffset: baselineHeroCtaOffset,
        profileAvatarTransform: baselineProfileAvatarTransform,
        profileSectionBoxes: baselineProfileSectionBoxes,
        streakTitleTransform: baselineStreakTitleTransform,
        streakCampfireFrame: baselineStreakCampfireFrame,
        pathBackgroundOffset: baselinePathBackgroundOffset,
        reviewCardBoxes: baselineReviewCardBoxes,
        timeTitleTransform: baselineTimeTitleTransform,
        timeStudyPanelBoxes: baselineTimeStudyPanelBoxes,
        taskTitleTransform: baselineTaskTitleTransform,
        taskCardBoxes: baselineTaskCardBoxes,
        subjectTitleTransform: baselineSubjectTitleTransform,
        subjectCardBoxes: baselineSubjectCardBoxes,
        reviewTitleTransform: baselineReviewTitleTransform,
        pathTitleTransform: baselinePathTitleTransform,
      },
      diff: {
        shellCornerRadius: Number((shellCornerRadius - baselineShellCornerRadius).toFixed(3)),
        shellBoxes: diffShellBoxes(shellBoxes, baselineShellBoxes),
        heroArtFrame: {
          x: Number((heroArtFrame.x - baselineHeroArtFrame.x).toFixed(3)),
          y: Number((heroArtFrame.y - baselineHeroArtFrame.y).toFixed(3)),
          width: Number((heroArtFrame.width - baselineHeroArtFrame.width).toFixed(3)),
          height: Number((heroArtFrame.height - baselineHeroArtFrame.height).toFixed(3)),
        },
        heroCtaOffset: {
          x: Number((heroCtaOffset.x - baselineHeroCtaOffset.x).toFixed(3)),
          y: Number((heroCtaOffset.y - baselineHeroCtaOffset.y).toFixed(3)),
        },
        profileAvatarTransform: {
          x: Number((profileAvatarTransform.x - baselineProfileAvatarTransform.x).toFixed(3)),
          y: Number((profileAvatarTransform.y - baselineProfileAvatarTransform.y).toFixed(3)),
          scale: Number(
            (profileAvatarTransform.scale - baselineProfileAvatarTransform.scale).toFixed(3)
          ),
        },
        profileSectionBoxes: ['avatar', 'greeting', 'stats', 'badge'].reduce(
          (acc, key) => {
            const sectionKey = key as ProfileSectionKey
            acc[sectionKey] = {
              x: Number(
                (profileSectionBoxes[sectionKey].x - baselineProfileSectionBoxes[sectionKey].x).toFixed(3)
              ),
              y: Number(
                (profileSectionBoxes[sectionKey].y - baselineProfileSectionBoxes[sectionKey].y).toFixed(3)
              ),
              width: Number(
                (
                  profileSectionBoxes[sectionKey].width -
                  baselineProfileSectionBoxes[sectionKey].width
                ).toFixed(3)
              ),
              height: Number(
                (
                  profileSectionBoxes[sectionKey].height -
                  baselineProfileSectionBoxes[sectionKey].height
                ).toFixed(3)
              ),
            }
            return acc
          },
          {} as ProfileSectionBoxes
        ),
        streakTitleTransform: {
          x: Number((streakTitleTransform.x - baselineStreakTitleTransform.x).toFixed(3)),
          y: Number((streakTitleTransform.y - baselineStreakTitleTransform.y).toFixed(3)),
          scale: Number(
            (streakTitleTransform.scale - baselineStreakTitleTransform.scale).toFixed(3)
          ),
        },
        streakCampfireFrame: {
          x: Number((streakCampfireFrame.x - baselineStreakCampfireFrame.x).toFixed(3)),
          y: Number((streakCampfireFrame.y - baselineStreakCampfireFrame.y).toFixed(3)),
          width: Number((streakCampfireFrame.width - baselineStreakCampfireFrame.width).toFixed(3)),
          height: Number(
            (streakCampfireFrame.height - baselineStreakCampfireFrame.height).toFixed(3)
          ),
        },
        pathBackgroundOffset: {
          y: Number((pathBackgroundOffset.y - baselinePathBackgroundOffset.y).toFixed(3)),
        },
        reviewCardBoxes: ['math', 'science', 'english', 'social'].reduce(
          (acc, key) => {
            const cardKey = key as ReviewCardKey
            acc[cardKey] = {
              x: Number(
                (reviewCardBoxes[cardKey].x - baselineReviewCardBoxes[cardKey].x).toFixed(3)
              ),
              y: Number(
                (reviewCardBoxes[cardKey].y - baselineReviewCardBoxes[cardKey].y).toFixed(3)
              ),
              width: Number(
                (reviewCardBoxes[cardKey].width - baselineReviewCardBoxes[cardKey].width).toFixed(3)
              ),
              height: Number(
                (
                  reviewCardBoxes[cardKey].height - baselineReviewCardBoxes[cardKey].height
                ).toFixed(3)
              ),
            }
            return acc
          },
          {} as ReviewCardBoxes
        ),
        timeTitleTransform: {
          x: Number((timeTitleTransform.x - baselineTimeTitleTransform.x).toFixed(3)),
          y: Number((timeTitleTransform.y - baselineTimeTitleTransform.y).toFixed(3)),
          scale: Number(
            (timeTitleTransform.scale - baselineTimeTitleTransform.scale).toFixed(3)
          ),
        },
        timeStudyPanelBoxes: {
          pie: diffBox(timeStudyPanelBoxes.pie, baselineTimeStudyPanelBoxes.pie),
          stats: diffBox(timeStudyPanelBoxes.stats, baselineTimeStudyPanelBoxes.stats),
        },
        taskTitleTransform: {
          x: Number((taskTitleTransform.x - baselineTaskTitleTransform.x).toFixed(3)),
          y: Number((taskTitleTransform.y - baselineTaskTitleTransform.y).toFixed(3)),
          scale: Number(
            (taskTitleTransform.scale - baselineTaskTitleTransform.scale).toFixed(3)
          ),
        },
        taskCardBoxes: {
          math: diffBox(taskCardBoxes.math, baselineTaskCardBoxes.math),
          science: diffBox(taskCardBoxes.science, baselineTaskCardBoxes.science),
          english: diffBox(taskCardBoxes.english, baselineTaskCardBoxes.english),
          bonus: diffBox(taskCardBoxes.bonus, baselineTaskCardBoxes.bonus),
        },
        subjectTitleTransform: {
          x: Number((subjectTitleTransform.x - baselineSubjectTitleTransform.x).toFixed(3)),
          y: Number((subjectTitleTransform.y - baselineSubjectTitleTransform.y).toFixed(3)),
          scale: Number(
            (subjectTitleTransform.scale - baselineSubjectTitleTransform.scale).toFixed(3)
          ),
        },
        subjectCardBoxes: {
          math: diffBox(subjectCardBoxes.math, baselineSubjectCardBoxes.math),
          science: diffBox(subjectCardBoxes.science, baselineSubjectCardBoxes.science),
          chinese: diffBox(subjectCardBoxes.chinese, baselineSubjectCardBoxes.chinese),
          geography: diffBox(subjectCardBoxes.geography, baselineSubjectCardBoxes.geography),
        },
        reviewTitleTransform: {
          x: Number((reviewTitleTransform.x - baselineReviewTitleTransform.x).toFixed(3)),
          y: Number((reviewTitleTransform.y - baselineReviewTitleTransform.y).toFixed(3)),
          scale: Number(
            (reviewTitleTransform.scale - baselineReviewTitleTransform.scale).toFixed(3)
          ),
        },
        pathTitleTransform: {
          x: Number((pathTitleTransform.x - baselinePathTitleTransform.x).toFixed(3)),
          y: Number((pathTitleTransform.y - baselinePathTitleTransform.y).toFixed(3)),
          scale: Number(
            (pathTitleTransform.scale - baselinePathTitleTransform.scale).toFixed(3)
          ),
        },
      },
    }

    const savedSections = [
      'shell',
      'hero',
      'profile',
      'streak',
      'path',
      'review',
      'time',
      'task',
      'subject',
    ]

    await mkdir(artifactDir, { recursive: true })
    await writeFile(artifactPath, JSON.stringify(payload, null, 2), 'utf8')

    return NextResponse.json({
      ok: true,
      artifactPath,
      savedSections,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to save page snapshot' }, { status: 500 })
  }
}
