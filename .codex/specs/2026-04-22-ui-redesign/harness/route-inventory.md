# Route Inventory

> `ws-00-scope-and-route-freeze` 的主盘点表。先补全 route，再冻结 must-keep 功能和目标状态。

## 总览
- 当前已盘点路由: 51
- 主要页面域: marketing / auth / dashboard-shell / practice / community / admin / course / public-profile
- 说明: `current state` 写现状, `target state` 写重构后目标

| route | domain | page owner spec | must-keep features | current state | target state | priority | evidence |
|---|---|---|---|---|---|---|---|
| `/` | marketing | `specs/d-01-marketing/` | hero, social proof, primary CTA, pricing entry, login/register entry | existing landing page, visually noisy | warm editorial hero with clear conversion | P0 | - |
| `/about-us` | marketing | `specs/d-01-marketing/` | brand story, team/trust narrative, CTA | existing content page | consistent brand narrative | P2 | - |
| `/how-it-works` | marketing | `specs/d-01-marketing/` | product flow, learning loop, CTA | existing explainer page | clearer step-by-step narrative | P1 | - |
| `/subjects` | marketing | `specs/d-01-marketing/` | subject overview, entry points, roadmap | existing subject overview page | cleaner curriculum gateway | P1 | - |
| `/pricing` | marketing | `specs/d-01-marketing/` | plan comparison, referral/voucher config, checkout CTA, FAQ, error states | existing pricing flow | trust-first pricing with same checkout behavior | P0 | - |
| `/success-stories` | marketing | `specs/d-01-marketing/` | testimonials, case studies, CTA | existing story page | more editorial proof section | P2 | - |
| `/blog` | marketing | `specs/d-01-marketing/` | list, category/filter, pagination, entry to detail | existing blog index | readable magazine-style list | P2 | - |
| `/blog/[slug]` | marketing | `specs/d-01-marketing/` | article content, related posts, not-found fallback | existing blog detail page | consistent article reading experience | P2 | - |
| `/study-guides` | marketing | `specs/d-01-marketing/` | guide structure, progression, CTA | existing guide page | calmer learning guide layout | P2 | - |
| `/student-care` | marketing | `specs/d-01-marketing/` | support entry, FAQ, help CTA | existing support page | support-first, trust-focused page | P2 | - |
| `/contact` | marketing | `specs/d-01-marketing/` | contact form, feedback submit, success/error states | existing form page | simpler support/contact experience | P2 | - |
| `/privacy` | marketing | `specs/d-01-marketing/` | policy text readability | existing legal page | clean legal reading layout | P3 | - |
| `/terms` | marketing | `specs/d-01-marketing/` | policy text readability | existing legal page | clean legal reading layout | P3 | - |
| `/login` | auth-and-entry | `specs/d-06-auth-and-entry/` | login form, `redirectTo`, OAuth, reset link, error states | existing auth entry page | cleaner auth bridge into product | P0 | - |
| `/register` | auth-and-entry | `specs/d-06-auth-and-entry/` | register form, referral handling, validation, redirect | existing auth entry page | cleaner signup flow with same auth behavior | P0 | - |
| `/reset-password` | auth-and-entry | `specs/d-06-auth-and-entry/` | reset flow, success/error feedback, safe redirect | existing reset page | clear password recovery flow | P1 | - |
| `/dashboard` | dashboard-shell | `specs/d-02-dashboard-shell/` | profile bootstrap, stats, auth sync recovery, sign out, redirect fallback | existing dashboard home with account-sync fallback | unified landing shell after login | P0 | - |
| `/dashboard/settings` | dashboard-shell | `specs/d-02-dashboard-shell/` | profile form, avatar upload, goals, settings sections | existing settings page | calmer and more structured settings center | P1 | - |
| `/dashboard/settings/notifications` | dashboard-shell | `specs/d-02-dashboard-shell/` | notification preferences, save feedback | existing notifications settings | consistent preference editor | P2 | - |
| `/dashboard/leaderboard` | dashboard-shell | `specs/d-02-dashboard-shell/` | weekly ranking, user rank, badges, overview | existing leaderboard page | cleaner competition/status board | P1 | - |
| `/dashboard/achievements` | dashboard-shell | `specs/d-02-dashboard-shell/` | badge grid, stats, overview | existing achievements page | calmer achievements gallery | P1 | - |
| `/dashboard/courses` | dashboard-shell | `specs/d-02-dashboard-shell/` | course catalog, subject entry, continue learning | existing course hub | clearer learning navigation hub | P1 | - |
| `/dashboard/community` | community | `specs/d-04-community/` | feed, filters, search, pagination, board tabs | existing feed page | cleaner community reading flow | P1 | - |
| `/dashboard/community/new` | community | `specs/d-04-community/` | post composer, categories, subject selection, rich text, attachments, submit states | existing new post flow | calmer composition screen | P1 | - |
| `/dashboard/community/[postId]` | community | `specs/d-04-community/` | post detail, comments, likes, solved state, not-found fallback | existing detail page | focused discussion detail view | P1 | - |
| `/dashboard/practice` | practice | `specs/d-03-practice/` | subject bar, mode grid, chapter progress, past paper library, coach panel | existing practice center, already dense | training command center with strong hierarchy | P0 | - |
| `/dashboard/practice/smart-drill` | practice | `specs/d-03-practice/` | recommendation, question flow, HUD, summary | existing smart drill page | focused adaptive training loop | P0 | - |
| `/dashboard/practice/error-wiper` | practice | `specs/d-03-practice/` | error repair workflow, progress, recap | existing error-repair page | calmer remediation workflow | P1 | - |
| `/dashboard/practice/mock-arena` | practice | `specs/d-03-practice/` | exam setup, timer, start flow | existing exam setup page | formal mock exam start screen | P1 | - |
| `/dashboard/practice/mock-arena/[examId]` | practice | `specs/d-03-practice/` | live exam session, navigation, submit, timer | existing live exam session | strict exam-taking interface | P1 | - |
| `/dashboard/practice/chapter-drill/[chapterId]` | practice | `specs/d-03-practice/` | chapter drill session, progress, next action | existing chapter drill session | focused chapter practice screen | P1 | - |
| `/dashboard/practice/past-paper/[paperId]` | practice | `specs/d-03-practice/` | paper detail/session, metadata, navigation | existing paper flow | formal paper review and session page | P1 | - |
| `/dashboard/practice/import` | practice | `specs/d-03-practice/` | import/fetch past paper, status, validation errors | existing import flow | utility import screen with clear states | P2 | - |
| `/dashboard/debug/ui-kit` | cross-route-regression-and-polish | `specs/d-07-cross-route-regression-and-polish/` | internal debug playground, component inspection | current page returns `notFound()` | internal-only or hidden tool page | P3 | - |
| `/admin` | admin | `specs/d-05-admin/` | role gate, overview KPIs, work queue, risks, audits | existing admin overview | unified admin control center | P0 | - |
| `/admin/users` | admin | `specs/d-05-admin/` | filterable user table, pagination, permission actions | existing user management page | more structured user operations table | P1 | - |
| `/admin/users/[id]` | admin | `specs/d-05-admin/` | user detail, tabs, impersonation, risk actions | existing user detail page | clearer user operation panel | P1 | - |
| `/admin/feedback` | admin | `specs/d-05-admin/` | feedback list, filters, state transitions | existing feedback inbox | clearer triage queue | P1 | - |
| `/admin/feedback/[id]` | admin | `specs/d-05-admin/` | feedback detail, resolve/close workflow | existing feedback detail | focused resolution view | P1 | - |
| `/admin/content` | admin | `specs/d-05-admin/` | admin content hub entry, route placeholder handling | current page returns `notFound()` | either intentional hidden route or future hub entry | P2 | - |
| `/admin/content/reports` | admin | `specs/d-05-admin/` | content reports, drawers, status tracking | existing reports list | clearer moderation/report inbox | P1 | - |
| `/admin/content/review` | admin | `specs/d-05-admin/` | review queue, list/detail, actions | existing review queue | clearer review workbench | P1 | - |
| `/admin/content/review/[questionId]` | admin | `specs/d-05-admin/` | review detail/editor, approve/reject, note fields | existing review detail | focused content review workspace | P1 | - |
| `/admin/content/import` | admin | `specs/d-05-admin/` | bulk import, progress, validation | existing import screen | clearer bulk import console | P1 | - |
| `/admin/content/statistics` | admin | `specs/d-05-admin/` | stats dashboard, chart breakdowns | existing statistics view | denser but cleaner analytics page | P2 | - |
| `/admin/referrals` | admin | `specs/d-05-admin/` | referral overview, attribution, rewards | existing referral admin page | operational referral console | P2 | - |
| `/admin/rewards` | admin | `specs/d-05-admin/` | reward center, grant/rollback, state feedback | existing rewards console | clear reward operations page | P2 | - |
| `/admin/vouchers` | admin | `specs/d-05-admin/` | voucher management, search, grant/expire | existing voucher page | clearer voucher ops view | P2 | - |
| `/course/[subjectId]` | dashboard-shell | `specs/d-02-dashboard-shell/` | course tree, next lesson CTA, chapter counts | existing course index page | cleaner course navigation hub | P1 | - |
| `/course/[subjectId]/[lessonId]` | dashboard-shell | `specs/d-02-dashboard-shell/` | lesson player, markdown content, completion, navigation, progress save | existing lesson player page | focused lesson consumption view | P1 | - |
| `/u/[handle]` | community | `specs/d-04-community/` | public profile, recent public posts, join CTA, handle normalization | existing public profile page | cleaner public identity page | P2 | - |

## 盘点规则
- 先按 route 或 route cluster 记录，不先按组件记录
- `must-keep features` 只写不能丢失的功能和关键状态，不写视觉建议
- `current state` 记录现在的问题，`target state` 记录目标信息架构或体验方向
