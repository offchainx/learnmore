# Prompt Iteration Log

> 目标：沉淀高频有效提示，淘汰低效提示。

| date | context | prompt_used | result | what_worked | what_failed | improved_prompt | next_action |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD |  |  |  |  |  |  |  |

| 2026-02-09 | 建立项目内Codex协作体系 | 按轻量强制方案创建模板与自动化 | 已创建文档、脚本与pre-commit校验 | 结构化模板+脚本化校验 | 默认权限下无法写入.git/config | 先实现脚本，再安装hooks并验证 | 从下一个真实Story开始执行spec四件套 |

| 2026-02-09 | 项目文件夹整理与归档 | 按指定删除废弃目录并迁移根目录文档到 docs/reports，同时处理个人文档归档 | 已删除 src/__deprecated__ 与 scripts/deprecated；已迁移4份报告到 docs/reports；个人蓝图移至 docs/personal 并加入 .gitignore；已修正文档引用 | - | - | - | - |

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

## 约束
- 每次会话结束至少追加一条记录
- `improved_prompt` 必须可直接复用
