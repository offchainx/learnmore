# Prompt Iteration Log

> 目标：沉淀高频有效提示，淘汰低效提示。

| date | context | prompt_used | result | what_worked | what_failed | improved_prompt | next_action |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD |  |  |  |  |  |  |  |

| 2026-02-09 | 建立项目内Codex协作体系 | 按轻量强制方案创建模板与自动化 | 已创建文档、脚本与pre-commit校验 | 结构化模板+脚本化校验 | 默认权限下无法写入.git/config | 先实现脚本，再安装hooks并验证 | 从下一个真实Story开始执行spec四件套 |

| 2026-02-09 | 项目文件夹整理与归档 | 按指定删除废弃目录并迁移根目录文档到 docs/reports，同时处理个人文档归档 | 已删除 src/__deprecated__ 与 scripts/deprecated；已迁移4份报告到 docs/reports；个人蓝图移至 docs/personal 并加入 .gitignore；已修正文档引用 | - | - | - | - |

| 2026-02-09 | P0 关键链路实现：Leaderboard/Community/Achievement/Billing/UI导航 | 实现 P0 公开发布+含付费计划 | 已完成 P0-00 文档体系，P0-06/07/08/09 核心代码落地，补充发布与回归清单 | 先建 spec 四件套，再实现关键接口改造 | 全量 tsc/lint 存在大量历史错误，未在本轮清理 | 先跑目标文件 eslint，再全量检查定位历史问题 | 继续推进 P0-04 Dashboard P0 化与 P0-05 Practice 验收，并执行端到端冒烟 |

| 2026-02-10 | P0-01 T-006 预发复测推进：发现预发 redeploy build failed，先修复 TypeScript 构建错误并回填 p0-01 预发进度 | 根据 Vercel build logs 定位 TS 错误，修复后确保 pnpm run build 通过；同时更新 p0-01 acceptance/tasks 记录预发复测现状 | 修复了导致 Vercel build 失败的两个 TS 类型问题（ReportIssueType 对齐 Prisma 枚举、PDFProcessOptions.onProgress 参数签名对齐 OCRResult），本地 pnpm run build 已通过；p0-01 文档已回填预发进度与阻塞 | 1) 直接用 Vercel build logs 的文件/行号定位问题；2) 对照 prisma/schema.prisma 的 enum 定义修复类型漂移；3) 先在本地 pnpm run build 验证再准备 redeploy | 预发 redeploy 版本 build failed 导致一直无法拿到包含最新修复的预发 URL 进行 T-006；另外早期尝试手写 curl 调 Server Action 在预发返回 500 digest，难以作为可验收证据 | 先确保预发 build 成功并产生 Ready 的部署，再进行预发 Action/Webhook 复测；对于 Server Action 调用，优先用真实浏览器请求或 Next RSC 编码方式构造请求 | 提交并推送修复 commit 到 main -> 触发 Vercel redeploy -> 重跑预发 webhook/action 验证并回填 acceptance -> 完成 T-006 结项 |

## 约束
- 每次会话结束至少追加一条记录
- `improved_prompt` 必须可直接复用
