import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
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

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as {
      heroArtFrame?: unknown
      heroCtaOffset?: unknown
      baseline?: {
        heroArtFrame?: unknown
        heroCtaOffset?: unknown
      }
    }

    const heroArtFrame = normalizeHeroArtFrame(body.heroArtFrame)
    const heroCtaOffset = normalizeHeroCtaOffset(body.heroCtaOffset)
    const baselineHeroArtFrame = normalizeHeroArtFrame(body.baseline?.heroArtFrame)
    const baselineHeroCtaOffset = normalizeHeroCtaOffset(body.baseline?.heroCtaOffset)

    if (!heroArtFrame || !heroCtaOffset || !baselineHeroArtFrame || !baselineHeroCtaOffset) {
      return NextResponse.json({ error: 'Invalid hero payload' }, { status: 400 })
    }

    const artifactDir = path.join(
      process.cwd(),
      '.codex',
      'artifacts',
      'hero-freeze'
    )
    const artifactPath = path.join(artifactDir, 'latest-hero-snapshot.json')

    const payload = {
      savedAt: new Date().toISOString(),
      heroArtFrame,
      heroCtaOffset,
      baseline: {
        heroArtFrame: baselineHeroArtFrame,
        heroCtaOffset: baselineHeroCtaOffset,
      },
      diff: {
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
      },
    }

    await mkdir(artifactDir, { recursive: true })
    await writeFile(artifactPath, JSON.stringify(payload, null, 2), 'utf8')

    return NextResponse.json({
      ok: true,
      artifactPath,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to save hero snapshot' }, { status: 500 })
  }
}
