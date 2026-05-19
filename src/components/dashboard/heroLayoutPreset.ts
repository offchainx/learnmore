export type HeroArtFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type HeroCtaOffset = {
  x: number
  y: number
}

export type HeroShellSize = {
  width: number
  height: number
}

export type DashboardHeroLayoutPreset = {
  shell: HeroShellSize
  contentMaxWidth: number
  artFrame: HeroArtFrame
  ctaOffset: HeroCtaOffset
}

export const defaultDashboardHeroLayoutPreset: DashboardHeroLayoutPreset = {
  shell: {
    width: 1070.137,
    height: 402.74,
  },
  contentMaxWidth: 432,
  artFrame: {
    x: -2.653,
    y: -9.222,
    width: 1071.821,
    height: 512.992,
  },
  ctaOffset: {
    x: 0.098,
    y: -73.641,
  },
}

function toFiniteNumber(
  value: unknown,
  fallback: number,
  min?: number,
  max?: number
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  let next = value
  if (typeof min === 'number') {
    next = Math.max(min, next)
  }
  if (typeof max === 'number') {
    next = Math.min(max, next)
  }

  return Number(next.toFixed(3))
}

export function normalizeDashboardHeroLayoutPreset(
  input: unknown
): DashboardHeroLayoutPreset {
  if (!input || typeof input !== 'object') {
    return defaultDashboardHeroLayoutPreset
  }

  const candidate = input as Partial<DashboardHeroLayoutPreset>
  const shell = candidate.shell ?? {}
  const artFrame = candidate.artFrame ?? {}
  const ctaOffset = candidate.ctaOffset ?? {}

  return {
    shell: {
      width: toFiniteNumber(
        (shell as Partial<HeroShellSize>).width,
        defaultDashboardHeroLayoutPreset.shell.width,
        720,
        1400
      ),
      height: toFiniteNumber(
        (shell as Partial<HeroShellSize>).height,
        defaultDashboardHeroLayoutPreset.shell.height,
        260,
        560
      ),
    },
    contentMaxWidth: toFiniteNumber(
      candidate.contentMaxWidth,
      defaultDashboardHeroLayoutPreset.contentMaxWidth,
      280,
      560
    ),
    artFrame: {
      x: toFiniteNumber(
        (artFrame as Partial<HeroArtFrame>).x,
        defaultDashboardHeroLayoutPreset.artFrame.x,
        -240,
        240
      ),
      y: toFiniteNumber(
        (artFrame as Partial<HeroArtFrame>).y,
        defaultDashboardHeroLayoutPreset.artFrame.y,
        -240,
        240
      ),
      width: toFiniteNumber(
        (artFrame as Partial<HeroArtFrame>).width,
        defaultDashboardHeroLayoutPreset.artFrame.width,
        720,
        1400
      ),
      height: toFiniteNumber(
        (artFrame as Partial<HeroArtFrame>).height,
        defaultDashboardHeroLayoutPreset.artFrame.height,
        280,
        820
      ),
    },
    ctaOffset: {
      x: toFiniteNumber(
        (ctaOffset as Partial<HeroCtaOffset>).x,
        defaultDashboardHeroLayoutPreset.ctaOffset.x,
        -120,
        220
      ),
      y: toFiniteNumber(
        (ctaOffset as Partial<HeroCtaOffset>).y,
        defaultDashboardHeroLayoutPreset.ctaOffset.y,
        -220,
        80
      ),
    },
  }
}

export function applyHeroPresetToShellBoxes<
  T extends { key: string; width: number; height: number }
>(boxes: readonly T[], preset: DashboardHeroLayoutPreset) {
  return boxes.map((box) =>
    box.key === 'hero'
      ? {
          ...box,
          width: Number(preset.shell.width.toFixed(3)),
          height: Number(preset.shell.height.toFixed(3)),
        }
      : box
  )
}
