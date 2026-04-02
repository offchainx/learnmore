import Link from 'next/link'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { normalizeHandle } from '@/lib/users/handle'

interface PublicHandlePageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({
  params,
}: PublicHandlePageProps): Promise<Metadata> {
  const { handle } = await params
  const normalizedHandle = normalizeHandle(handle)

  return {
    title: `@${normalizedHandle} | LearnMore`,
  }
}

export default async function PublicHandlePage({
  params,
}: PublicHandlePageProps) {
  const { handle } = await params
  const normalizedHandle = normalizeHandle(handle)

  if (!normalizedHandle) {
    notFound()
  }

  if (handle !== normalizedHandle) {
    redirect(`/u/${normalizedHandle}`)
  }

  const user = await prisma.user.findUnique({
    where: { handle: normalizedHandle },
    select: {
      id: true,
      username: true,
      handle: true,
      avatar: true,
      grade: true,
      createdAt: true,
      posts: {
        where: { isPrivate: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const displayName = user.username || `@${user.handle}`

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_48%),linear-gradient(180deg,rgba(8,15,29,0.96),rgba(3,8,18,0.98))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.38)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.handle}`
              }
              alt={displayName}
              className="h-24 w-24 rounded-full border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm uppercase tracking-[0.22em] text-sky-200/72">
                Public profile
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <div className="mt-2 text-lg text-sky-200">@{user.handle}</div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                {user.grade ? <span>Grade {user.grade}</span> : null}
                <span>{user._count.posts} posts</span>
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString('en-MY')}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Join LearnMore
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Recent public posts</h2>
              <p className="mt-1 text-sm text-slate-400">
                Public community activity associated with this handle.
              </p>
            </div>
          </div>

          {user.posts.length === 0 ? (
            <div className="mt-6 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-sm text-slate-400">
              No public posts yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {user.posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{post.category || 'Discussion'}</span>
                    <span>•</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString('en-MY')}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-300">
                    {post.content}
                  </p>
                  {post.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5">
                    <Link
                      href={`/login?redirectTo=${encodeURIComponent(`/dashboard/community/${post.id}`)}`}
                      className="text-sm font-medium text-sky-300 hover:text-sky-200"
                    >
                      Sign in to view discussion
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
