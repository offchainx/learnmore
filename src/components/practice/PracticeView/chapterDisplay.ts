export interface ParsedChapterDisplay {
  code: string
  primaryTitle: string
  secondaryTitle: string | null
  combinedTitle: string
}

const STRUCTURED_CHAPTER_TITLE_PATTERN =
  /^(\d+(?:\.\d+)+)\s+([^-]+?)(?:-(.+))?$/

export function parseStructuredChapterTitle(
  title: string,
): ParsedChapterDisplay | null {
  const normalizedTitle = title.trim()
  const match = STRUCTURED_CHAPTER_TITLE_PATTERN.exec(normalizedTitle)

  if (!match) {
    return null
  }

  const [, code, primaryTitle, secondaryTitle] = match

  return {
    code,
    primaryTitle: primaryTitle.trim(),
    secondaryTitle: secondaryTitle?.trim() || null,
    combinedTitle: secondaryTitle?.trim()
      ? `${primaryTitle.trim()}-${secondaryTitle.trim()}`
      : primaryTitle.trim(),
  }
}
