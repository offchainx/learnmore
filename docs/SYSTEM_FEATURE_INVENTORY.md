# LearnMore 全站功能资产与权限索引 (System Feature Inventory)

**文档说明**: 本文档记录了 LearnMore 平台所有已实现、开发中及规划中的功能点，并明确了其在权限系统 (Story-045) 中的对应关系。

---

## 🛠️ 1. 练习中心 (Practice Center)
*核心：刷题、解析与 AI 纠错*

| 功能点 | 描述 | 状态 | 权限 Key | 最低等级 |
| :--- | :--- | :--- | :--- | :--- |
| **基础练习** | 课本同步基础题库访问 | ✅ 已完成 | `content.bank.basic` | Starter |
| **历年真题** | 各省市中考历年真题库 | ✅ 已完成 | `content.bank.past_paper` | Standard |
| **专项强化** | 针对特定知识点的深度练习包 | 🚧 待数据 | `content.bank.advanced` | Smart Plus |
| **智能刷题** | 基于掌握度的算法推题 (Smart Drill) | ✅ 已完成 | `practice.mode.smart_drill` | Smart Plus |
| **错题消灭** | 游戏化错题复习 (Error Wiper) | ✅ 已完成 | `practice.mode.error_wiper` | Standard |
| **模拟考场** | 全真环境模拟考试 (Mock Arena) | ✅ 已完成 | `practice.mode.mock` | Smart Plus |
| **参考答案** | 仅显示题目对错与最终答案 | ✅ 已完成 | `analysis.view.answer` | Starter |
| **详细解析** | 步骤级文字解析与思路指导 | ✅ 已完成 | `analysis.view.detailed` | Standard |
| **知识关联** | 点击解析中的知识点跳转知识图谱 | 🚧 待集成 | `analysis.view.graph_link` | Smart Plus |
| **AI 图片解析** | 拍题上传自动识别录入 (Smart Parser) | ✅ 已完成 | `tool.smart_parser` | Standard (限次) |

---

## 📺 2. 课程学习 (Learning Engine)
*核心：视频学习与进度管理*

| 功能点 | 描述 | 状态 | 权限 Key | 最低等级 |
| :--- | :--- | :--- | :--- | :--- |
| **课程目录浏览** | 6大学科章节树状结构查看 | ✅ 已完成 | `course.browse` | Starter |
| **基础视频播放** | 标准清晰度视频观看 | ✅ 已完成 | `course.play.basic` | Starter |
| **高清视频播放** | 1080P/4K 无广告播放体验 | ✅ 已完成 | `course.play.hd` | Standard |
| **进度自动同步** | 跨端同步视频播放位置与状态 | ✅ 已完成 | `course.progress.sync` | Starter |
| **课件下载** | 配套 PDF 讲义、练习册下载 | 🚧 规划中 | `course.download.resource` | Smart Plus |
| **知识图谱视图** | 可视化章节依赖关系图 (Lite) | 🚧 规划中 | `course.graph.view` | Standard |

---

## 🤖 3. AI 智能辅导 (AI & Intelligence)
*核心：智学版 (Smart Plus) 的核心价值交付*

| 功能点 | 描述 | 状态 | 权限 Key | 最低等级 |
| :--- | :--- | :--- | :--- | :--- |
| **错误归因分析** | AI 分析“为什么错”，识别思维误区 | ✅ 已完成 | `ai.attribution` | Smart Plus |
| **交互式 Copilot** | 针对当前题目的苏格拉底式对话 | 📝 Story-047 | `ai.chat` | Smart Plus |
| **提分建议** | 基于全站表现生成的个性化学习路径 | ✅ 已完成 | `ai.path_recommend` | Smart Plus |
| **智能出题** | 根据薄弱项实时生成变式题 | 🚧 规划中 | `ai.gen_question` | Premier |

---

## 📊 4. 数据中心 (Data & Analytics)
*核心：数据回溯期 (Data Retention) 策略*

| 功能点 | 描述 | 状态 | 权限 Key | 策略详情 |
| :--- | :--- | :--- | :--- | :--- |
| **短效记忆** | 最近 7 天的学习历史与错题记录 | ✅ 已完成 | `data.retention.starter` | Starter |
| **中效记忆** | 最近 30 天的学习数据保留 | ✅ 已完成 | `data.retention.standard` | Standard |
| **永久记忆** | 全量历史数据永久存储与回溯 | ✅ 已完成 | `data.retention.full` | Smart Plus |
| **能力雷达** | 6 大学科掌握度可视化 | ✅ 已完成 | `data.viz.radar` | Starter |
| **考分预测** | 基于练习数据的期末考试预测 | ✅ 已完成 | `data.viz.forecast` | Standard |
| **数据导出** | 导出 PDF 学习报告/错题集 | 🚧 待开发 | `data.export` | Smart Plus |

---

## 💬 5. 社区与社交 (Community & Growth)
*核心：留存与增长*

| 功能点 | 描述 | 状态 | 权限 Key | 最低等级 |
| :--- | :--- | :--- | :--- | :--- |
| **社区浏览** | 查看互助帖子与笔记 | ✅ 已完成 | `community.view` | Starter |
| **发帖/评论** | 发布求助、分享笔记或参与讨论 | 🚧 待集成 | `community.interact` | Standard |
| **全站排行榜** | XP 与 练习量实时排名展示 | ✅ 已完成 | `community.leaderboard` | Starter |
| **虚拟自习室** | 沉浸式专注空间与同伴状态显示 | 📝 Story-045 | `community.study_room` | Smart Plus |
| **Referral 系统** | 邀请好友获得会员时长奖励 | 📝 Story-042 | `growth.referral` | Standard |

---

## 👨‍👩‍👧 6. 家长功能 (Parental Control)
*核心：教育投资的透明度*

| 功能点 | 描述 | 状态 | 权限 Key | 最低等级 |
| :--- | :--- | :--- | :--- | :--- |
| **学习月报** | 定期推送的静态数据摘要 | 🚧 待集成 | `parent.report.monthly` | Standard |
| **实时看板** | 随时查看孩子的实时活跃度与知识热力图 | ✅ 已完成 | `parent.report.realtime` | Smart Plus |
| **奖励心愿单** | 家长设置任务奖励，系统自动公证 | 🚧 待集成 | `parent.wishlist` | Premier |

---

## 🔐 7. 管理后台 (Admin Dashboard)
*核心：上帝视角与系统治理*

| 功能点 | 描述 | 状态 | 权限 Key | 最低等级 |
| :--- | :--- | :--- | :--- | :--- |
| **用户 360 视图** | 身份、订阅、学习、安全的全景查询 | 📝 Story-046 | `admin.user.view` | Admin |
| **伪装登录** | 以学生身份登录前台复现 Bug | 📝 Story-046 | `admin.user.impersonate` | Admin |
| **权限覆写** | 手动修改用户 Tier 或 过期时间 | ✅ 已完成 | `admin.user.override` | Admin |
| **内容审核** | 审核题目识别结果与社区发言 | 📝 Story-044 | `admin.content.review` | Admin |

---

## 📏 权限 Key 命名规范
1.  **分层结构**: `[模块].[功能].[具体操作]` (例如 `content.bank.advanced`)。
2.  **布尔值 vs. 枚举**: 简单开关使用布尔值，多档位功能（如解析深度）返回字符串标识。
3.  **配置驱动**: 所有代码中的权限检查必须引用此清单中的 Key。
