# 技术架构与选型手册 (Tech Stack)

**版本**: v2.2 (Complete) | **架构模式**: Next.js Modular Monolith

---

## 1. 整体架构图 (System Architecture)

参考企业级分层架构设计，结合 Serverless 特性：

```mermaid
graph TD
    %% 客户端层
    subgraph Client_Layer [客户端层]
        Web[Web 端 (React 18 + TS)]
        Mobile[移动端适配 (Responsive)]
    end

    %% 网关/CDN层
    subgraph Gateway_Layer [网关/CDN层]
        CDN[Vercel Edge Network]
        Firewall[WAF / DDoS 防护]
    end

    %% 应用层 (Next.js BFF)
    subgraph App_Layer [应用层 - Next.js App Router]
        direction LR
        API_Routes[API Routes / Server Actions]

        subgraph Modules [业务模块]
            direction TB
            UserMod[用户模块]
            CourseMod[课程模块]
            ExamMod[题库模块]
            StatsMod[统计模块]
            CommMod[社区模块]
            GrowthMod[成长模块]
        end
        
        API_Routes -- 调用 --> Modules
    end

    %% 数据层
    subgraph Data_Layer [数据持久层]
        direction LR
        Auth_DB[Supabase Auth - 认证 DB]
        Postgres_DB[(PostgreSQL - 业务数据)]
        Redis_KV[(Redis - 缓存/KV)]
        Supabase_Storage[Supabase Storage - 文件]
    end

    %% 基础设施层
    subgraph Infra_Layer [基础设施层]
        Monitor[Vercel Analytics - 监控]
        Logs[Sentry - 日志]
        CI[GitHub Actions - CI/CD]
    end

    %% 链路关系
    Client_Layer --> |HTTPS| Gateway_Layer
    Gateway_Layer --> API_Routes
    
    API_Routes --> Postgres_DB
    API_Routes --> Auth_DB
    API_Routes --> Redis_KV
    API_Routes --> Supabase_Storage

    %% 关键同步
    Auth_DB -- "Trigger 同步" --> Postgres_DB
    
    API_Routes -- "报告" --> Monitor
    API_Routes -- "上报" --> Logs
```

---

## 2. 详细技术栈清单 (Tech Stack Details)

### 2.1 前端应用层 (Frontend)
| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **核心框架** | **Next.js 14+** | App Router 架构，SSR 保证 SEO。 |
| **语言** | **TypeScript 5.x** | 全局类型安全。 |
| **UI 组件库** | **Shadcn/ui** | 结合 Tailwind CSS，快速构建现代界面。 |
| **状态管理** | **Zustand** | 管理播放器状态、答题进度等全局状态。 |
| **视频播放** | **React Player** | 封装好的播放器组件，支持 HLS 流媒体。 |
| **富文本** | **Tiptap** | 社区发帖、评论编辑器 (Headless, 可定制)。 |
| **图表库** | **Recharts** | 绘制学习趋势图、雷达图。 |
| **公式渲染** | **KaTeX** | 数学/物理公式渲染。 |

### 2.2 后端逻辑层 (Backend Logic)
| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **API 范式** | **Server Actions** | 优先使用 Server Actions 处理表单提交和数据变更。 |
| **数据验证** | **Zod** | 运行时 Schema 验证 (API 输入/输出)。 |
| **日期处理** | **Day.js** | 轻量级日期库 (代替 Moment.js)。 |

### 2.3 数据持久层 (Data)
| 模块 | 技术选型 | 关键规范 |
| :--- | :--- | :--- |
| **数据库** | **PostgreSQL** | 托管于 Supabase。核心业务数据存储。 |
| **ORM** | **Prisma** | **强制使用**。所有数据库操作通过 Prisma Client 进行。 |
| **缓存/KV** | **Redis** (Upstash) | **新增**。用于实现“实时排行榜”和“热门帖子缓存”。 |
| **文件存储** | **Supabase Storage** | 存储课程视频 (MP4/HLS) 和图片资源。 |

### 2.4 基础设施 (Infra)
| 模块 | 选型 | 说明 |
| :--- | :--- | :--- |
| **认证** | **Supabase Auth** | 仅用于 Token 颁发，通过 Trigger 同步用户表。 |
| **监控** | **Vercel Analytics** | 性能与流量监控。 |
| **错误追踪** | **Sentry** | 生产环境异常捕获。 |

---

## 3. 开发规范 (核心摘录)

### 3.1 目录结构约定 (Modular)
```
src/
├── app/
│   ├── (learn)/course/    # 课程模块路由
│   ├── (exam)/quiz/       # 题库模块路由
│   ├── (community)/       # 社区模块路由
│   └── dashboard/         # 用户中心
├── components/
│   ├── video-player/      # 播放器组件
│   ├── quiz-engine/       # 答题核心组件
│   └── charts/            # 图表组件
├── lib/
│   ├── prisma.ts
│   └── redis.ts           # Redis 客户端实例
└── actions/               # 后端业务逻辑
    ├── course-actions.ts
    ├── exam-actions.ts
    └── social-actions.ts
```

### 3.2 关键实现策略

#### 视频防盗链
- 视频文件设为 `Private` Bucket。
- 播放时通过 Server Action 生成带签名的临时 URL (`signedUrl`)，有效期 1 小时。

#### 实时排行榜
- 使用 Redis `ZSET` (Sorted Set) 存储用户积分。
- 写入: `ZADD leaderboard:week <score> <userId>`
- 读取: `ZREVRANGE leaderboard:week 0 9 WITHSCORES`

#### 数据同步 (Auth)
- 保持使用 PostgreSQL Trigger 同步 `auth.users` 到 `public.users` (详见 v1.3 定义)。

---

## 4. 环境变量清单 (新增)
```bash
# Supabase & DB
DATABASE_URL="postgres://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Redis (用于排行榜/缓存)
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
```
