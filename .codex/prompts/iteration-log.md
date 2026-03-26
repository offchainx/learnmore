# Prompt Iteration Log

> 目标：沉淀高频有效提示，淘汰低效提示。

| date       | context | prompt_used | result | what_worked | what_failed | improved_prompt | next_action |
| ---------- | ------- | ----------- | ------ | ----------- | ----------- | --------------- | ----------- |
| YYYY-MM-DD |         |             |        |             |             |                 |             |

| 2026-02-09 | 建立项目内Codex协作体系 | 按轻量强制方案创建模板与自动化 | 已创建文档、脚本与pre-commit校验 | 结构化模板+脚本化校验 | 默认权限下无法写入.git/config | 先实现脚本，再安装hooks并验证 | 从下一个真实Story开始执行spec四件套 |

| 2026-02-09 | 项目文件夹整理与归档 | 按指定删除废弃目录并迁移根目录文档到 docs/reports，同时处理个人文档归档 | 已删除 src/**deprecated** 与 scripts/deprecated；已迁移4份报告到 docs/reports；个人蓝图移至 docs/personal 并加入 .gitignore；已修正文档引用 | - | - | - | - |

| 2026-02-09 | P0 关键链路实现：Leaderboard/Community/Achievement/Billing/UI导航 | 实现 P0 公开发布+含付费计划 | 已完成 P0-00 文档体系，P0-06/07/08/09 核心代码落地，补充发布与回归清单 | 先建 spec 四件套，再实现关键接口改造 | 全量 tsc/lint 存在大量历史错误，未在本轮清理 | 先跑目标文件 eslint，再全量检查定位历史问题 | 继续推进 P0-04 Dashboard P0 化与 P0-05 Practice 验收，并执行端到端冒烟 |

| 2026-02-10 | P0-01 T-006 预发复测推进：发现预发 redeploy build failed，先修复 TypeScript 构建错误并回填 p0-01 预发进度 | 根据 Vercel build logs 定位 TS 错误，修复后确保 pnpm run build 通过；同时更新 p0-01 acceptance/tasks 记录预发复测现状 | 修复了导致 Vercel build 失败的两个 TS 类型问题（ReportIssueType 对齐 Prisma 枚举、PDFProcessOptions.onProgress 参数签名对齐 OCRResult），本地 pnpm run build 已通过；p0-01 文档已回填预发进度与阻塞 | 1) 直接用 Vercel build logs 的文件/行号定位问题；2) 对照 prisma/schema.prisma 的 enum 定义修复类型漂移；3) 先在本地 pnpm run build 验证再准备 redeploy | 预发 redeploy 版本 build failed 导致一直无法拿到包含最新修复的预发 URL 进行 T-006；另外早期尝试手写 curl 调 Server Action 在预发返回 500 digest，难以作为可验收证据 | 先确保预发 build 成功并产生 Ready 的部署，再进行预发 Action/Webhook 复测；对于 Server Action 调用，优先用真实浏览器请求或 Next RSC 编码方式构造请求 | 提交并推送修复 commit 到 main -> 触发 Vercel redeploy -> 重跑预发 webhook/action 验证并回填 acceptance -> 完成 T-006 结项 |
| 2026-03-04 | T-006 路由收口：通知设置并轨 + 全量路由扫描 | 将 `/dashboard/settings/notifications` 下线并把通知设置统一到 `/dashboard/settings?tab=notifications`；同步扫描 `src/app/**/page.tsx` 并更新受保护/无保护路由基线 | 代码已收口（旧路由 404、通知入口改链、settings 通知矩阵统一保存），并在 p0-02 文档补齐全量路由清单和“可能重复/可收口”候选 | 先收口重复入口，再做全量扫描，最后统一回填 specs 与 release 审计文档 | 如果只改代码不补基线，后续路由治理容易再次漂移 | 先执行“代码收口 -> 路由全扫 -> 文档单一事实源更新 -> lint/tsc 校验”固定流水线 | 下一步按候选清单逐条确认是否下线，并补齐 AC-04 全路由矩阵验证证据 |
| 2026-03-04 | T-006 路由进一步收口：下线 `/admin/content`、`/course/**`、`/checkout/config` | 将 4 个确认废弃路由改为显式 404，并清理入口与回填文档（含受保护/无保护路由表） | 代码侧已完成路由下线、入口替换（内容入口收口到 `/admin/content/review`；课程入口收口到 `/dashboard/courses`；支付入口收口到 `/pricing` 直连 checkout action），文档同步完成 | 先处理真实入口（避免死链），再下线路由，最后更新审计文档与回归用例 | 仅下线路由不处理入口会产生体验回退（点进去即 404） | 固化“入口替换 -> 路由下线 -> 审计文档更新 -> lint/tsc”四步法 | 下一步继续按路由矩阵做 `admin/**` 与 `dashboard/**` 全量验收打证据 |

| 2026-03-04 | p0-06-practice-prod-validation/T-005 | 修复 Past Year Paper 模式：真实数据源 + 动态路由 + 可提交 | 新增 getPastPapersBySubject、改造 PastPapersSection、新增 /dashboard/practice/past-paper/[groupId] 页面、QuizView chapterId 支持可选、T-005 置为 done | - | - | - | - |

| 2026-03-04 | T-007 请求治理与路由噪音收敛 | 排查并修复 impersonate/notifications/practice/admin-permissions 异常请求 | 已完成代码修复并更新文档，待提交推送 | - | - | - | - |

| 2026-03-04 | T-007 请求治理 | 将/dashboard/practice多请求聚合为首屏一次+切科目一次，并同步文档 | 新增bootstrap/subject-data聚合API并完成前端接入，文档已更新 | - | - | - | - |

| 2026-03-04 | T-007 收尾验收 | 补齐空闲态请求观测证据并完成文档收尾 | 完成Playwright 1-3分钟观测并将T-007状态更新为done/pass | - | - | - | - |

| 2026-03-05 | T-007 请求噪音治理扩展 | 修复leaderboard/community/admin-users进入页面多次POST请求并更新文档 | 新增3个GET读取API并完成首屏服务端注入，消除页面路径多次POST噪音 | - | - | - | - |

| 2026-03-05 | p0-06-practice-prod-validation/T-012~T-014 | 实现 Examcoo 抓取脚本并完成10题导入与发布验证 | 新增 fetch-view-paper 与 import-fetched-json 脚本；从 view/id/2430396 抓取10题（含可用解析）；入库10题到 source_file/question_group/questions；状态迁移到 PUBLISHED；更新 tasks T-012/T-013/T-014 | - | - | - | - |

| 2026-03-05 | p0-02 AC-01 收尾（T-008/T-009） | 完成 AC-01 剩余任务并内测，补齐本地+预发证据 | 新增 auth.test.ts 并完成 Playwright+SQL 证据，T-008/T-009 置 done | 单测覆盖 redirectTo/登出幂等 + 浏览器跨标签验证 + SQL 快照 | Vercel 预发 MCP 受限（Auth required） | 先做本地可复现证据闭环（单测+Playwright+SQL），再补预发等价复测与风险说明 | 推进 AC-02（impersonate status 与 impersonation_sessions 一致性） |

| 2026-03-05 | p0-02 AC-02（T-010~T-012） | 实现并验证 impersonate status 与 impersonation_sessions 一致性 | 完成 status 一致性收敛、单测与本地API/SQL对照，AC-02 三个任务置 done | 抽离会话判定函数 + 接口三重一致性校验 + 临时会话对照脚本 | 云端预发仍受 Vercel Auth required 限制 | 先做 deterministic 单测覆盖状态机，再用临时会话做 API/SQL 黑盒对照 | 推进 AC-03 user/voucher 字段与逻辑核对 |
| 2026-03-05 | p0-02 AC-03（T-013~T-015） | 完成 user/voucher 字段映射核对、voucher 核销幂等加固与证据回填 | 已新增 voucher_redemptions 唯一约束并改造 webhook 核销并发逻辑；完成本地 SQL/Prisma 对照；tasks/acceptance/release 文档同步收尾 | 先落库约束再改业务逻辑，最后用临时数据脚本验证并清理，证据链完整 | 全量 lint 受历史遗留错误影响，无法作为本轮通过条件 | 采用“定向 tsc + 定向 eslint + 数据库脚本证据”作为 AC-03 固定闭环模板 | 推进 T-006 收尾项（权限矩阵与 admin 回归证据补齐） |

| 2026-03-05 | P0-06练习模块重构与文档同步 | 同步T-016~T-025计划并推进练习数据模型改造 | 已完成文档更新与大部分代码改造，待继续完成编译修复与剩余任务 | - | - | - | - |

| 2026-03-05 | T-016 questions结构优化 | 完成questions字段重构迁移并做内测 | 已新增迁移SQL与导入脚本新口径，prisma validate与tsc通过 | - | - | - | - |

| 2026-03-05 | 修复content review筛选崩溃 | 处理question-service PrismaClientValidationError | 已对过滤参数做UUID/枚举/空范围校验，subjectId=all不再报错 | - | - | - | - |

| 2026-03-05 | 修复questions.version运行时错误 | 修复admin review和dashboard的Prisma查询崩溃 | 已改为显式select并过滤非法筛选参数，Prisma不再访问questions.version | - | - | - | - |

| 2026-03-09 | 提交用户确认的全量已暂存改动 | 按用户要求提交并推送当前全部已暂存变更 | 已执行全量提交流程并准备推送 | - | - | - | - |

| 2026-03-09 | P0-07 T-007 验证收尾 | 执行 staged 门禁验证、RLS 校验、Practice 定向测试并回填 acceptance | 已完成本地验证；修复 test:supabase 脚本并验证连接通过；准备执行 staged codex:check | - | - | - | - |

| 2026-03-09 | T-010 dashboard 登录态性能优化 | 执行四项优化并验证 | 已完成区域固定、接口拆分、首屏轻量化与超时降级，lint/build 通过 | - | - | - | - |

| 2026-03-09 | T-011 dashboard 性能二轮优化 | 提交后继续测试，并检查是否可通过 Vercel MCP 获取 Speed Insights | 完成鉴权快路径、请求级缓存与 dashboard 子页查询减载，lint/build 通过，待部署与线上复测 | - | - | - | - |

| 2026-03-09 | T-011 复测与结案 | 提交后继续测试并检查 Vercel MCP Speed Insights 可调用性 | 完成部署与生产复测；MCP 当前 Auth required，CLI OpenAPI 未发现 Speed Insights endpoint | - | - | - | - |
| 2026-03-10 | T-019.6 导入页深色改版与 hydration 稳定性修复 | 参考 Remote 风格输出深色主题并保持功能不变；针对 Radix 组件 hydration mismatch 做 mounted 后渲染门禁 | 完成 ImportClient/StatsCards/BatchTable 深色重构；修复 SubjectFilter/QuestionReviewTable/BatchTable 多次 hydration 报错；tsc 与接口烟测通过 | 先锁定视觉 token 与信息层级，再局部替换样式；对高风险 Radix 交互组件做客户端挂载后渲染 | 仅做样式不足以解决反复 hydration 报错，需额外处理 SSR/CSR 首帧一致性 | 对含 Radix Trigger 的列表/筛选组件统一采用“SSR 占位 + mounted 渲染交互”模板，避免 id 漂移 | 让用户在 import/review 页面实测；若仍复现，再将个别触发器改为 dynamic(ssr:false) |
| 2026-03-10 | p0-04 T-006.1 练习中心命名与骨架收口 | 按冻结方案统一 Practice 相关组件语义命名，并保持路由 slug 与文件路径稳定 | 完成 PracticeCenterScreen / PracticeSubjectBar / PracticeModeGrid / ChapterProgressSection / PastPaperLibrarySection / PracticeCoachPanel / SmartDrillSession / ErrorWiperSession / MockArenaSetup / ChapterDrillSession 的导出名与引用链修正；定向 ESLint 通过 | 先只改语义层，不夹带视觉重构，降低回归面 | 文件路径仍保留旧名，目录迁移留给后续任务 | 命名统一与视觉改造必须拆开提交，避免问题定位混乱 | 继续推进 T-006.2 主页面训练指挥台布局落地 |

| 2026-03-10 | 提交当前全部改动并推送，补发生产部署验证 Speed Insights | 在保留当前工作区全部改动的前提下，完成提交、推送、生产部署与 Speed Insights 采集排查 | 已定位 preview 已接入 Speed Insights、production 尚未吃到代码；当前补齐 iteration log 后继续执行全量提交与推送 | 先用 vercel curl 对比 preview/production 页面源码，确认是否实际包含 SpeedInsights 组件 | 直接 commit 被 codex hook 拦截，原因是未更新 iteration log | 提交前先检查仓库 hooks 和 codex 日志门禁，再一次性补齐提交上下文 | 完成 commit/push，等待 production redeploy 后重新核对页面源码与 Speed Insights 面板 |

| 2026-03-12 | 练习中心首页重构、Smart Drill 模式壳子统一、弹窗 preview 与连续滚动作答改造，并同步整理 admin/content 相关在工作区中的既有改动后准备统一提交 | 先更新 tasks，再抽共享 Practice 组件；Smart Drill 入口改弹窗，训练页改连续滚动；提交前必须补 iteration log 并走 codex:close | 完成练习中心视觉收口、Smart Drill 统一壳子、mock 预览、首页弹窗 preview 与连续作答；已满足 codex 提交门禁前置要求 | 先锁定共用壳子和结果组件，再局部替换 Smart Drill；将 preview 放回首页弹窗能明显减轻空页面感；连续作答前先修复表单 id 冲突避免多题同页异常 | 直接 git commit 会被 codex hook 拦截；全仓 tsc 仍受 admin/content-reports 既有类型问题影响，不能作为本轮新增问题判断依据 | 当任务涉及页面流改造时，先对齐入口形态、会话容器、结果页壳子，再做具体模式；提交前先检查仓库是否要求 codex:close / iteration-log，避免被 hook 中断 | 重新执行 git commit 与 git push；若推送成功，再继续下一批 Practice 模式重构或根据用户反馈微调 Smart Drill |

| 2026-03-12 | T-006.12 管理仪表盘基线对齐收口与首屏定高调整 | 对齐批量导入与内容管理页的 admin 工作台视觉语言，收口管理仪表盘 header/KPI/三列模块排布，压缩首屏高度并默认每列展示 5 条记录、滚轮切页。 | 完成管理仪表盘 header/KPI/三列工作台统一，去除快捷入口，三列模块默认展示 5 条并支持滚轮切页；同步更新 task 文档与页面入口。 | 先统一 header 与 KPI 壳层，再将列表抽成同一类分页卡片容器，能够稳定收口视觉语言和首屏高度。 | 工作区存在大量与本轮无关的练习中心改动，不能直接全量提交；仓库 commit hook 还要求先补 iteration log。 | 当后台首页需要快速收口为 dashboard 时，优先固定首屏高度、统一卡片头部与列表分页交互，再逐步压缩局部信息密度。 | 提交本轮管理仪表盘相关文件，继续推进下一个基线对齐 task。 |
| 2026-03-12 | T-006.17 等级卡片/排行榜整合基线对齐 | 以排行榜为主页面整合等级、XP、下一个目标与推荐挑战，并保留独立成就页作为完整成就库入口。 | 完成排行榜页的个人成长总览、推荐挑战和追赶目标模块改造；补充成就统计字段与任务文档更新，准备提交并推送本轮变更。 | 先复用排行榜现有数据链路，再把成就页中最有行动价值的信息压到右侧工作区，能在不重写规则系统的前提下完成页面整合。 | 全仓 `tsc --noEmit` 仍受 admin/content-reports 与 users mock 等既有类型错误影响，不能作为本轮新增问题判断依据。 | 当两个高相关页面要整合时，优先保留高频主页面，把成长摘要、最近目标和追赶动作并入；完整收藏型内容继续放独立二级页。 | 完成本轮定向提交与推送后，再根据视觉反馈继续微调排行榜主舞台与独立成就页的关系。 |
| 2026-03-12 | T-006.17 二轮收口：排行榜首屏可见、右侧 tabs 合并与 mock 预览 | 根据用户反馈继续压缩排行榜页字体层级和首屏高度，确保榜单始终可见，并补上开发态 mock 便于对齐视觉。 | 完成段位区重排、成长总览压缩、推荐挑战/追赶目标合并为 tabs 卡、榜单切换回 mock fallback 与入口收口；文档同步更新，准备本地提交。 | 先保证排行榜主舞台可见，再压右侧卡片和字体；空数据时回退 mock 比保留空壳更利于对齐视觉。 | 工作区仍有大量与本轮无关的 Practice/Admin 改动，提交时必须精确挑选文件；全仓 tsc 仍受历史问题影响。 | 做 dashboard 型页面时，先锁定首屏主信息，再处理右侧辅助模块；开发期可短期接入 mock 预览，但要与真实接口解耦。 | 提交本轮排行榜相关文件；后续若用户确认版式，再决定是否移除 mock fallback 或继续细调表格字级。 |

| 2026-03-13 | 用户要求将当前项目全部改动提交并推送到 origin/main，过程中触发仓库 codex 门禁 | 在执行全量 git commit/push 前，先检查仓库 hooks 与 codex 提交要求；若有代码改动门禁，优先补齐 iteration log，再重新执行完整提交流程 | 已定位 pre-commit 会校验 .codex/prompts/iteration-log.md；补齐本次日志后继续执行全量提交与推送 | 先执行 git status/branch/remote 检查，再根据 hook 报错反查 scripts/codex/check-session.mjs 与 close-session.mjs，能快速定位阻塞点并用项目内脚本补齐要求 | 直接 git commit 会被 pre-commit 拦截，无法在未补 iteration log 的情况下完成推送 | 当用户要求直接提交或推送当前工作区时，先检查仓库是否存在 commit hooks、codex:check 或 iteration-log 类门禁；若存在，先用仓库内脚本补齐会话日志，再执行 git add/commit/push，避免在提交阶段被打断 | 重新暂存 .codex/prompts/iteration-log.md，执行 git commit，并将本地 main 上未推送提交全部推送到 origin/main |

| 2026-03-13 | T-006.20 二轮收口：社区页向 Dashboard 视觉靠拢、发帖页改双列表单 | 对照 Dashboard 深蓝舱体样式继续收口学员社区主页与发帖页，统一卡片背景/透明度，并把正文以上字段改成左右排布以便首屏看完。 | 已完成社区主页主卡、帖子流与右栏模块的深蓝渐变舱体统一；发帖页正文以上字段改成双列卡片布局；定向 prettier 与 eslint 通过，准备提交并推送。 | 先统一 surface 与 inset card 层级，再重排发帖页字段，比只调局部 class 更稳定，也更接近 Dashboard 的视觉语言。 | 工作区存在 CoursesView、public/images 与 ui-analysis 等无关改动，提交时必须只选社区相关文件。 | 当同一产品线页面需要统一气质时，优先对齐 surface、透明度、边框和输入壳层，再处理信息排布；表单类页面优先双列收口首屏。 | 提交并推送本轮社区相关文件，然后继续推进 T-006.21 设定页面基线对齐。 |

| 2026-03-13 | T-006.19 course learning baseline alignment and hero asset integration | 更新课程学习页 hero 视觉，接入学科主题图，统一学科选择器，并同步更新 P0-04 tasks 文档，新增 T-006.22/T-006.23 并顺延后续任务。 | 完成课程学习页蓝青玻璃 hero 收口，接入 8 个学科 hero 素材、去掉 pills 抬升、优化进度条与右栏信息；更新 tasks.md，新增 T-006.22 调整 sidebar、T-006.23 统一所有页面视觉语言，并将后续任务编号顺延。 | - | - | - | - |

| 2026-03-13 | T-006.22 sidebar adjustment and handoff to T-006.23 | 重排 dashboard sidebar 信息架构，收口为主导航、管理、轻量 Upgrade、底部账户区四段式，并根据反馈补充 icon 彩色 hover、设置齿轮微动；同步更新 tasks 状态。 | 完成 sidebar 第一轮结构重排与交互收口：下移 admin、弱化 Upgrade、等级卡并入账户区、统一设置激活态，并加入 icon 彩色 hover 与齿轮微动；tasks.md 已更新为 T-006.22 done、T-006.23 doing。 | - | - | - | - |
| 2026-03-13 | T-006.21 设置页单页工作台改造与锚点滚动收口 | 将设置页从 tab 切换改成单页 section 工作台，统一 Dashboard 深蓝舱体风格，并将左 rail 与右侧 section 拆成固定导航 + 独立滚动区；同时修复 ReferralSection 的 hydration mismatch。 | 完成设置页 header/套餐胶囊/左 rail/五大 section 的单页工作台改造；右侧 section 改为独立滚动容器，按 section 标题锚点定位；修复 referral 链接 SSR/CSR 不一致导致的 hydration 报错；定向 prettier 与 eslint 通过。 | 先把 settings 改成单页 section，再把左 rail 与右侧内容彻底分开，比继续修 sticky + 主容器滚动的 offset 更稳定；最后用大底部缓冲解决最后一个 section 无法滚到位的问题。 | 共享主滚动容器 + sticky rail 会不断受到 hero、main padding 和 section 外框高度影响，导致视觉基线始终漂移；直接在渲染期使用 window.location 也会触发 hydration mismatch。 | 当页面需要“固定目录 + 内容锚点跳转”时，优先拆成“左 rail 固定 + 右侧独立滚动容器 + section 标题锚点”的结构；SSR 页面里凡是链接或 origin 依赖，默认用稳定占位文案渲染，客户端交互时再补绝对地址。 | 提交并推送设置页相关改动；后续若继续微调，只调整右侧滚动安全区和锚点 offset，不再回到共享滚动结构。 |

| 2026-03-13 | T-006.23.1 页面级标题壳子统一，并补课程学习/学员社区外层页面壳包裹范围 | 先抽统一 PageHeroShell，再把 Dashboard/Courses/Practice/Community/Settings/Leaderboard/Achievements 顶部接入；随后按反馈把 Courses 和 Community 改成与练习中心一致的整页外层壳结构，Community Hub 移到标题右侧。 | 完成统一标题壳子组件接入主要页面；修复 Settings/Community/Leaderboard 相关类型与兼容问题；课程学习和学员社区的外层壳已包住整段主体，社区标题胶囊移至标题右侧。 | - | - | - | - |
| 2026-03-15 | 用户要求提交并推送当前工作区全部改动 | 先检查 git 状态/分支/远端，再执行全量暂存与提交；若被仓库 hook 拦截，则反查 codex 门禁并补齐 iteration log 后继续 commit/push | 已定位 pre-commit 会强制要求更新 `.codex/prompts/iteration-log.md`；当前已补日志并重新准备执行提交与推送 | 先读 `git status`、`git branch --show-current`、`git remote -v`，再根据报错查看 `scripts/codex/check-session.mjs`，能快速确定阻塞不是代码本身而是仓库流程门禁 | 直接 `git commit` 会因为未更新 iteration log 被 hook 拦截，中断推送流程 | 当用户要求“直接提交并推送当前全部改动”时，先检查仓库是否有 codex/log 类 hook；若提交失败，立即读取 hook 脚本并补齐最小 required 文件，再重新执行 `git add -A -> git commit -> git push` | 完成当前全量 commit 和 push，确认工作区回到 clean |

| 2026-03-19 | T-006.24 设置页偏好链路修复与 spec tasks 文档排版恢复 | 修复 Settings 的语言/主题持久化与 system 主题错误切换，恢复 p0-04 tasks.md 紧凑表格格式，并补充规则避免再被 Prettier 炸开 | 已修复 Settings 语言/主题草稿提交流程与误导文案；恢复 p0-04 tasks.md 紧凑表格；补充 GEMINI 规则禁止对 spec/tasks 文档跑 Prettier 或自动表格对齐工具 | 先按实际代码定位设置页状态流，再用最小范围文档规则修补提交门禁 | 直接 git commit 被 codex hook 拦截，因为未更新 iteration-log | 提交前先检查仓库是否要求 iteration-log 或 codex:close，并同步保护 spec/tasks 文档排版 | 提交当前修复，然后继续清 T-006.24 的浅色主题页面残留并完成内测 |

| 2026-03-19 | T-006.24 浅色主题代表页收口与内测通过 | 完成 T-006.24 的最终收口：修复 Dashboard Widgets/DailyMissions、Practice Preview Dialogs、Pricing 浅色化、Admin review/users detail 浅色壳层，Playwright 实测 Dashboard/Courses/Practice/Community/Settings/Pricing/Leaderboard/Achievements/Admin 代表页并回写 tasks.md 为 done。 | T-006.24 已完成并通过本地内测，代表页矩阵全部 accepted。 | - | - | - | - |

| 2026-03-19 | 回滚 pricing 页面 | 按要求回滚 marketing pricing 页面，并在后续推进中排除该页面。 | pricing 页面已恢复到上一个提交版本，后续不再修改该页。 | - | - | - | - |

| 2026-03-19 | 提交当前全部工作区改动作为R1-R3前基线 | 按用户要求先提交当前所有改动，再继续收口 T-006.24 的 R1/R2/R3。 | 当前工作区全部改动已作为基线提交，后续只在此基础上继续修改 R1/R2/R3。 | - | - | - | - |

| 2026-03-19 | 完成T-006.24的R1-R3浅色残留收口 | 修复前台学科选中态、sidebar active 对比度、community 低对比度文案与 avatar fallback 的浅色残留。 | R1/R2/R3 已完成，相关共享样式与页面组件已更新并通过定向 eslint。 | - | - | - | - |

| 2026-03-19 | 回滚R1-R3的共享样式试改 | 按用户要求回滚上一版对 sidebar active、practice subject selector、community 辅助文案和 avatar fallback 的共享样式修改。 | 已将这四处修改精确回滚到 97bf443 状态，不影响 pageSurfaces/pageTypography 的其他未提交改动。 | - | - | - | - |

| 2026-03-20 | 重新收口R1-R2-R3并限定在局部组件 | 重新实现 R1/R2/R3，但只改 Courses/Practice 的本地学科选择器、Community 的本地低对比度元素，以及 UserNav/AvatarUpload 的头像 fallback，不再碰共享 token 与 sidebar。 | R1/R2/R3 已以局部组件补丁方式重做，避免影响无关页面视觉。 | - | - | - | - |

| 2026-03-20 | T-006.23 capsule 视觉语言统一 | 以 Community Hub 为基准，把所有页面标题旁 capsule 的视觉和渲染路径统一到同一套语言，并确保直接渲染到前端。 | 新增共享 PageHeroTitle，统一 Community/Dashboard/Courses/Practice/Settings/Leaderboard/Achievements 及 Admin 各页 hero capsule 渲染路径；补充 capsule 不换行与 shrink 约束，定向 eslint 通过。 | 先确认问题在标题行组合结构而不只是 HeroCapsule token；再抽共享标题组件并只改真实页面标题区，避免影响无关 badge。 | 直接 git commit 被 codex hook 拦截，因为未更新 iteration-log。 | 提交前先检查仓库 codex hook；涉及全局视觉统一时，优先统一真实渲染路径，再调整共享样式细节。 | 提交本轮 capsule 统一改动，然后拆解 T-006.25 的实现范围与子任务。 |

| 2026-03-24 | 用户要求把当前工作区全部改动统一提交并推送到 origin/main；过程中补齐 T-006.25 文档回写、轻量回归与导航/空态统一收口。 | 先检查分支/远端/工作区，再执行全量暂存、补齐 iteration-log 门禁、完成 commit 与 push。 | 已完成 T-006.25 收口与文档回写，定位并处理 codex 提交门禁；当前准备重新执行全量 commit/push。 | 先看 git status/branch/remote，再根据 pre-commit 报错反查 codex:check 与 codex:close 要求，能快速定位阻塞并补齐。 | 直接 git commit 会被 pre-commit 拦截；如果不先更新 iteration-log，无法完成全量推送。 | 当用户要求直接推送当前全部改动时，先执行 git 状态检查，再优先运行 pnpm codex:close 补齐 iteration-log，最后再做 git add -A、commit、push。 | 重新执行 git commit，并把当前 main 上的未推送提交全部推送到 origin/main。 |
| 2026-03-24 | 练习中心章节体系、知识蜂巢、学科章节录入与 T-007.3 读链路二次收口 | 先冻结章节层级与入口规则，再逐科整理章节与 preview，最后回到 Practice 读链路，把叶子章节消费、真题隔离和 Error Wiper 定义压进服务层查询。 | 已完成中文/英文/数学/科学/历史/地理章节与 preview 对齐；补充规则文档与任务清单；完成 T-007.3 第二轮读链路收口并推送到 `codex/practice-structure-read-rules` 分支。 | 先把“规则”与“数据结构”定清楚，再改服务层读取逻辑，能显著减少后续 T-007.4 和内容导入阶段的返工。 | 若不先固化叶子章节/真题隔离/Error Wiper 规则，后续写链路和题目录入会继续口径漂移。 | 当练习中心涉及章节体系和多入口题池时，优先固化 `chapterId + tags`、叶子章节消费、真题隔离和 Error Wiper 定义，再推进读取与写入链路。 | 继续按已固化规则进入 T-007.4，处理提交、幂等与副作用收口。 |
| 2026-03-25 | 题目导入与审核链路收口：多站点网页导入底座、导入真题开关、审核时间展示、软删除与练习读链路放宽 | 先把导入入口从单站点硬编码改成 adapter/runner；再补审核台可用性和软删除；最后放开联调阶段的难度门槛，优先打通非真题练习入口。 | 已完成 web-import 架构接入、Examcoo adapter、正式导入链路切换、审核时间/科目显示修复、批量审核修复、导入“是否为真题”开关、软删除与“已删除”tab、Smart Drill/随机题难度限制临时移除，并将四个工作包回填 SOP。 | 先把“题进哪个题池”和“审核台能不能处理题”收口，再处理练习入口为空的问题，能最快形成可验证闭环。 | 如果不先区分真题/非真题，就会误以为 Smart Drill 读取异常；如果直接硬删除，会把 attempts/report 关系一起删掉，代价太大。 | 当题库链路同时涉及导入、审核和练习消费时，优先收口“真题开关 + 软删除 + 入口过滤规则”，先打通可观测主链路，再补 AI 章节打标。 | 提交本轮改动并用 Playwright 走导入弹窗、审核删除和 Smart Drill 冒烟；下一轮进入 AI 辅助章节打标。 |

| 2026-03-25 | T-007.4 练习写链路、幂等与副作用收口 | 统一 Practice 提交链路，新增 clientSessionId 幂等、收口 Mock Arena 条件提交与 Error Wiper 批量会话提交，并同步文档与测试 | 已完成 T-007.4：统一 exam_records/user_attempts 总账细账模型、落地幂等键、统一副作用、完成 Error Wiper 一轮一总账改造，定向测试与 db push 通过 | 先锁定总账/细账职责，再抽共享 persist/effects helper，能用最小改动覆盖 Smart Drill、Chapter Drill、Mock Arena 与 Error Wiper | 旧测试对 Error Wiper 和 Mock Arena 提交模型假设过时，需要同步调整 mock 与断言 | 涉及练习提交时，先审计所有提交入口与副作用，再抽统一提交核心和副作用核心，最后补客户端 session key 与定向测试 | 提交当前 T-007.4 改动；如继续推进则进入 T-007.5 清理 preview/mock 正式展示 |
| 2026-03-25 | 工作包 D 章节打标与导入页轮询收口 | 为导入链路和审核台补上“规则优先 + AI 可选”的章节打标，并去掉 `/admin/content/import` 空闲状态下的固定 5 秒轮询。 | 已新增章节打标器、导入前自动补章节、审核台 `AI补章节` 动作与 SOP 回写；导入页仅在存在处理中批次时轮询，空闲状态 6 秒内不再重复请求页面。 | 先用当前科目的叶子章节做规则命中，再把未命中的题收敛到小候选集，能显著降低 token 成本，也避免 AI 自由乱猜。 | Next server action 直接收 `string[]` 会被当成临时客户端引用，导致审核台动作 500；按钮事件也会把 `MouseEvent` 误当成题目 ID。 | server action 默认优先用对象入参；客户端批量动作不要直接把事件处理函数当回调传入，需要显式包装为 `() => action()`。 | 清理当前历史题的章节缺口，并继续推进非真题样本进入 `Chapter Drill / Mock Arena` 的端到端验证。 |
| 2026-03-25 | 章节打标 AI 提供方切换到 Gemini | 按用户提供的 Gemini key，把章节打标 AI 从 Anthropic 优先改成 Gemini 优先，并验证“规则未命中”的题也能走 AI 补章节。 | 已接入 Gemini API，当前优先使用 `gemini-2.5-flash-lite` 做章节候选排序；样例“辛亥革命推翻了哪个朝代？”已成功命中 `辛亥革命与中华民国的建立` 章节。 | 先调用 Google 模型列表确认 key 真可用，再选便宜且对新 key 可用的 Flash Lite，能避免一上来就踩废弃模型。 | `gemini-1.5-flash` 与 `gemini-2.0-flash-lite` 对该 key 不可用或已对新用户关闭，如果不先试模型列表会反复 404。 | 接第三方模型前先调用 `ListModels` 验证当前 key 实际可用的模型名，再把代码默认值切到可调用且便宜的版本。 | 用 Gemini 给现有无章节的历史题批量补一轮 `chapterId`，再验证 `Chapter Drill / Mock Arena` 读取效果。 |
| 2026-03-26 | 修复章节练习空题池与审核 KPI 口径漂移 | 先排查“有 chapterId 但 Chapter Drill 仍为空”的真实过滤链，再修正审核页顶部 KPI 的统计口径，并把 Step 6 的实施颗粒度回写到 SOP。 | 已为 `getRandomQuestions` 增加“小题池被最近作答排空时自动回退”的兜底，并统一排除软删除题；`getContentStats` 现已支持按 `subjectId` 统计、默认排除软删除，并改为事务执行避免连接池打爆；SOP 中 Step 6 已拆成审核台信息完整化、审核动作可用性验证、练习链路抽样验证、异常口径回看四个子步骤。 | 先用数据库核出真实阻塞是“仅 1 题已发布且已被 admin 最近 30 天做过”，再把修复点放在共享取题服务层，比在单页面做特判更稳，也能顺带覆盖 Mock/随机题。 | 审核 KPI 原实现既不排除软删除，也不跟当前科目筛选联动；同时并发 5 个统计查询在当前连接池限制下会偶发 `max clients reached`。 | 当练习入口在早期题池很小的时候，最近作答排除必须提供回退兜底；后台 KPI 一旦存在科目筛选，就必须明确区分“全局口径”还是“当前筛选口径”，并默认排除软删除题。 | 提交本轮修复并继续进入 Step 6，对审核台动作、Smart Drill、Chapter Drill、Mock Arena 做一轮按入口分组的真实消费验证。 |
| 2026-03-26 | Step 6 第一轮真实消费验证：打通 Smart Drill / Chapter Drill / Mock Arena | 以历史非真题为样本，按入口逐一验证真实消费链路；先修小题池和连接池问题，再把未支持题型从练习题池中过滤掉，并把规则回写到 SOP。 | 已完成 Step 6 第一轮：Smart Drill 前台实测能生成 5 道可作答单选题；Chapter Drill 前台实测能消费 2 道带 `chapterId` 的历史题；Mock Arena 通过真实 selector + autostart 已能创建会话并进入考试页，当前历史题池可组成 2 题模拟卷。 | 先用服务层和前台双验证，把“读得到题”和“页面能真实进入答题状态”分开看，比只看数据库或只看页面空态更容易定位阻塞点。 | Smart Drill 在小题池场景下会因为 recent/all attempts 过滤只剩 1 题；Mock Arena 原实现用并发难度查询把连接池打爆；题池里还混入了前台暂不支持完整作答的 `ESSAY`。 | 练习入口联调阶段要同时校验三层：共享取题服务是否回退兜底、入口自身是否还叠加额外过滤、前台是否真的支持该题型完成整轮作答；未支持题型必须在服务层提前剔除。 | 提交 Step 6 第一轮修复，随后进入下一轮：补更多已发布非真题样本与章节覆盖，再决定是否开始回到 Past Paper 链路。 |
| 2026-03-26 | Step 6 补练习模式退出保留科目上下文 | 在练习中心和各练习模式间传递 `subjectId`，确保从历史等科目进入 Smart Drill / Error Wiper / Mock Arena / Chapter Drill / Past Paper 后退出，仍回到原科目而不是默认中文；同步把该项纳入 SOP 主任务。 | 已完成练习中心按 URL `subjectId` 初始化选中科目、各模式退出/结果页返回链路带回 `subjectId`，并用 Playwright 实测“历史 -> Smart Drill -> 退出 -> 历史练习中心”闭环通过。 | 先在练习中心首页支持 `subjectId` 初始化，再统一把退出/结果页返回链接都收敛到同一个 `practiceCenterHref`，能最小改动覆盖多入口。 | 如果只改退出按钮、不改练习中心首页初始化，回跳虽然带了 `subjectId`，页面仍会因为默认选中首科而表现为回到中文。 | 涉及“上下文返回”的问题时，必须同时检查“入口 URL 是否携带上下文”“目标页是否真正读取并应用上下文”“退出与结果页是否统一走同一返回地址”这三层。 | 继续处理 Task 6 剩余项：暗色模式可读性、分析卡片逻辑复核，以及其余练习模式的补充回归。 |

## 约束

- 每次会话结束至少追加一条记录
- `improved_prompt` 必须可直接复用
