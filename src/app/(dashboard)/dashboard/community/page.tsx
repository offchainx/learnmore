import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { CommunityClientWrapper } from './client-wrapper'
import { CommunityView } from '@/components/dashboard/views/CommunityView'
import {
  getCachedCommunityCategories,
  getCachedCommunityFeed,
} from '@/lib/cache/sitewide'

type CommunitySortMode = 'recent-posts' | 'recent-replies' | 'most-comments'
type CommunityScopeFilter = 'all' | 'following' | 'by-date'
type CommunityBoardId = string | 'all' | 'following' | 'unanswered'

function readParam(
  value: string | string[] | undefined
): string | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function parseSort(raw?: string): CommunitySortMode {
  if (raw === 'recent-replies' || raw === 'most-comments') return raw
  return 'recent-posts'
}

function parseScope(raw?: string): CommunityScopeFilter {
  if (raw === 'following' || raw === 'by-date') return raw
  return 'all'
}

function parseBoardId(raw?: string): CommunityBoardId {
  if (raw === 'all' || raw === 'following' || raw === 'unanswered') {
    return raw
  }
  return raw || 'all'
}

export const metadata: Metadata = {
  title: 'Community - LearnMore',
  description: 'Join the discussion with other students.',
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams?: Promise<{
    search?: string | string[]
    sort?: string | string[]
    board?: string | string[]
    scope?: string | string[]
    subjectId?: string | string[]
    category?: string | string[]
    tab?: string | string[]
  }>
}) {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }

  const resolvedSearchParams = (await searchParams) || {}
  const initialSearchQuery = readParam(resolvedSearchParams.search) || ''
  const initialSortMode = parseSort(readParam(resolvedSearchParams.sort))
  const initialScopeFilter = parseScope(
    readParam(resolvedSearchParams.scope)
  )
  const initialBoardId = parseBoardId(
    readParam(resolvedSearchParams.board) ||
      readParam(resolvedSearchParams.subjectId) ||
      (readParam(resolvedSearchParams.tab) === 'unanswered'
        ? 'unanswered'
        : undefined)
  )
  const initialSubjectId =
    initialBoardId !== 'all' &&
    initialBoardId !== 'following' &&
    initialBoardId !== 'unanswered'
      ? initialBoardId
      : undefined
  const initialCategory = readParam(resolvedSearchParams.category) || undefined
  const initialUnanswered =
    readParam(resolvedSearchParams.tab) === 'unanswered' ||
    initialBoardId === 'unanswered'

  const [categories, postResult] = await Promise.all([
    getCachedCommunityCategories(),
    getCachedCommunityFeed({
      page: 1,
      limit: 20,
      search: initialSearchQuery || undefined,
      sort: initialSortMode,
      subjectId: initialSubjectId,
      category: initialCategory,
      unanswered: initialUnanswered,
      viewerUserId: profile.id,
      viewerRole: profile.role,
    }),
  ])

  return (
    <CommunityClientWrapper user={profile}>
      <CommunityView
        initialPosts={postResult.posts}
        subjects={categories}
        initialSearchQuery={initialSearchQuery}
        initialSortMode={initialSortMode}
        initialScopeFilter={initialScopeFilter}
        initialBoardId={initialBoardId}
      />
    </CommunityClientWrapper>
  )
}
