export function normalizeExamcooImageUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  const value = rawUrl.trim()
  if (!value) return null

  const absoluteUploadsToPaperMatch = value.match(
    /^https?:\/\/img\.examcoo\.com\/uploads\/\d+\/(\d+)\/images\/(\d{6})\/([^/?#]+)$/i
  )
  if (absoluteUploadsToPaperMatch) {
    const [, ownerId, yearMonth, filename] = absoluteUploadsToPaperMatch
    return `https://img.examcoo.com/paper/${ownerId}/${yearMonth}/${filename}`
  }

  const relativeUploadsToPaperMatch = value.match(
    /^\/uploads\/\d+\/(\d+)\/images\/(\d{6})\/([^/?#]+)$/i
  )
  if (relativeUploadsToPaperMatch) {
    const [, ownerId, yearMonth, filename] = relativeUploadsToPaperMatch
    return `https://img.examcoo.com/paper/${ownerId}/${yearMonth}/${filename}`
  }

  return value
}

export function replaceExamcooLegacyUploadsInMarkdown(markdown = ''): string {
  return markdown.replace(
    /!\[([^\]]*)\]\((https?:\/\/img\.examcoo\.com\/uploads\/[^)\s]+)\)/gi,
    (_match, altText: string, url: string) => {
      const normalized = normalizeExamcooImageUrl(url) ?? url
      return `![${altText}](${normalized})`
    }
  )
}
