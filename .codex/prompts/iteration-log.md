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

## 约束
- 每次会话结束至少追加一条记录
- `improved_prompt` 必须可直接复用
