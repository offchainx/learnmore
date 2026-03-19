# 🚀 LearnMore v1.0 生产环境上线检查清单

**生成时间**: 2025-12-22
**项目状态**: 开发中 → 准备上线
**目标**: Error-Free, 真实数据, 生产级质量

---

## 📊 当前完成度: 60%

### ✅ 已完成 (60%)
- 数据库架构完整 (Prisma + Supabase)
- 认证系统完整 (Supabase Auth)
- 社区功能连接真实数据
- 错题本系统连接真实数据
- 博客系统连接真实数据
- 家长端基础功能
- 代码质量: 0 ESLint错误, 0 TypeScript错误

### ⚠️ 进行中 (40%)
- Dashboard核心功能仍使用Mock数据
- Stripe Payment配置未完成
- 部分页面需要真实内容填充

---

## 🔴 Critical Priority (必须完成才能上线)

### 1. ❌ 连接MyCoursesView到真实数据库 (High Priority)

**当前问题**:
- 完全使用Mock数据 (`src/components/dashboard/shared.tsx`)
- 科目、章节、课程都是假数据
- 用户进度不真实

**修复步骤**:
```bash
# 1. 创建Server Action
touch src/actions/courses.ts

# 2. 实现以下函数:
- getSubjects() - 获取所有科目
- getChapters(subjectId) - 获取章节树
- getLessons(chapterId) - 获取课程列表
- getUserProgress(userId) - 获取用户进度

# 3. 更新组件
# 修改 src/components/dashboard/views/MyCoursesView.tsx
# 移除 Mock 数据导入,使用 Server Actions
```

**验收标准**:
- [ ] 科目数据来自 `Subject` 表
- [ ] 章节数据来自 `Chapter` 表
- [ ] 课程数据来自 `Lesson` 表
- [ ] 进度数据来自 `UserProgress` 表
- [ ] 空状态有引导提示

**预计时间**: 4-6小时

---

### 2. ❌ 连接QuestionBankView到真实数据库 (High Priority)

**当前问题**:
- Quiz questions 硬编码 (第13-18行)
- Hexagon hive 是假数据
- 无法实际练习

**修复步骤**:
```bash
# 1. 创建Server Action (如果不存在)
# src/actions/questions.ts 应该已经有部分实现

# 2. 实现以下函数:
- getQuestionsByChapter(chapterId, limit)
- getQuestionsByDifficulty(difficulty, subjectId)
- submitAnswer(questionId, userAnswer)
- getQuestionStats(userId)

# 3. 更新组件
# 修改 src/components/dashboard/views/QuestionBankView.tsx
# 连接到真实Question表
```

**验收标准**:
- [ ] 题目数据来自 `Question` 表
- [ ] 支持按难度筛选
- [ ] 支持按章节筛选
- [ ] 提交答案保存到 `UserAttempt` 表
- [ ] Knowledge Hive 显示真实掌握度

**预计时间**: 6-8小时

---

### 3. ❌ 连接LeaderboardView到Server Action (High Priority)

**当前问题**:
- 使用硬编码排名数据
- Server Action已存在但未使用

**修复步骤**:
```bash
# Server Action已存在: src/actions/leaderboard.ts

# 修改 src/components/dashboard/views/LeaderboardView.tsx
# 替换 Mock 数据:
import { getLeaderboard, getMyRank } from '@/actions/leaderboard';

# 在组件中调用:
const leaderboardData = await getLeaderboard({ period: 'WEEKLY', limit: 100 });
const myRank = await getMyRank('WEEKLY');
```

**验收标准**:
- [ ] 排行榜数据来自 `LeaderboardEntry` 表
- [ ] 支持按周期筛选 (WEEKLY/MONTHLY/ALL_TIME)
- [ ] 显示用户自己的排名
- [ ] 排名实时更新

**预计时间**: 2-3小时

---

### 4. ❌ 连接ParentDashboardView到Server Action (High Priority)

**当前问题**:
- 完全使用Mock children数据
- Server Action已实现但前端未调用

**修复步骤**:
```bash
# Server Action已存在: src/actions/parent.ts

# 修改 src/components/dashboard/views/ParentDashboardView.tsx
# Line 14-39: 删除 mockChildren

# 使用真实数据:
import { getLinkedStudents, getStudentStats } from '@/actions/parent';

useEffect(() => {
  async function loadChildren() {
    const children = await getLinkedStudents();
    setChildren(children);
  }
  loadChildren();
}, []);
```

**验收标准**:
- [ ] 孩子列表来自 `ParentStudent` 表
- [ ] 学习统计来自 `UserProgress` + `UserAttempt`
- [ ] 邀请码功能可用
- [ ] 支持多子女切换

**预计时间**: 3-4小时

---

### 5. ⚠️ 完成Stripe Payment配置 (Critical)

**当前问题**:
- Price IDs未配置完整
- 只有1个Price ID有值
- 用户无法完成付款

**修复步骤**:
```bash
# 1. 访问 Stripe Dashboard
https://dashboard.stripe.com/test/products

# 2. 创建3个Products:
- Self-Learner Plan (免费试用)
- Scholar Plan (¥89/月 或 ¥890/年)
- Champion Plan (¥189/月 或 ¥1890/年)

# 3. 为每个Product创建2个Price (Monthly + Annual)

# 4. 更新 .env.local:
NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_ANNUAL="price_xxxxx"
```

**验收标准**:
- [ ] 所有6个Price IDs已配置
- [ ] Stripe Webhook已设置
- [ ] 测试支付流程成功
- [ ] Success/Cancel回调页面正常

**预计时间**: 2小时

---

## 🟠 High Priority (强烈建议完成)

### 6. ⚠️ 数据库种子数据填充

**当前问题**:
- 数据库可能为空
- 用户看到空白页面

**修复步骤**:
```bash
# 1. 创建种子脚本 (如果不存在)
touch prisma/seed-full.ts

# 2. 填充以下数据:
- Subjects (6个科目: 数学、物理、化学、英语、语文、生物)
- Chapters (每个科目至少3个章节)
- Lessons (每个章节至少5个课程)
- Questions (每个章节至少20道题)
- Sample Users (测试账号)

# 3. 运行种子脚本
pnpm db:seed
```

**验收标准**:
- [ ] 每个科目有完整的章节结构
- [ ] 每个章节有足够的题目 (最少20题)
- [ ] 题目包含各种难度 (1-5)
- [ ] 题目支持LaTeX数学公式

**预计时间**: 8-12小时 (内容创作时间)

---

### 7. ⚠️ 空状态优化

**当前问题**:
- 空状态提示太简单
- 缺少引导用户的CTA

**需要优化的页面**:
```
- DashboardHome (第136, 196, 235行)
- MyCoursesView (如果没有课程)
- QuestionBankView (如果没有题目)
- LeaderboardView (如果排行榜为空)
- CommunityView (如果没有帖子)
```

**修复模板**:
```tsx
{items.length === 0 ? (
  <Card className="p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
      <Icon className="w-8 h-8 text-blue-500" />
    </div>
    <h3 className="text-lg font-bold mb-2">还没有{itemName}</h3>
    <p className="text-slate-500 mb-6">
      {guidanceText}
    </p>
    <Button onClick={handleStartAction}>
      {actionText}
    </Button>
  </Card>
) : (
  // 正常列表
)}
```

**预计时间**: 3-4小时

---

### 8. ⚠️ Email发送功能验证

**当前问题**:
- 不确定Resend API是否正确配置
- Newsletter可能发送失败

**验证步骤**:
```bash
# 1. 检查Resend API Key
echo $RESEND_API_KEY

# 2. 测试发送邮件
# 在 src/lib/email.ts 添加测试函数

# 3. 检查发送日志
# 访问 https://resend.com/logs
```

**验收标准**:
- [ ] Newsletter订阅邮件能发送
- [ ] 欢迎邮件能发送
- [ ] 重置密码邮件能发送

**预计时间**: 1-2小时

---

## 🟡 Medium Priority (建议完成)

### 9. ⚠️ 实现Referral System (可选)

**当前问题**:
- UI存在但没有后端逻辑

**修复步骤**:
```bash
# 1. 创建数据库模型
# prisma/schema.prisma
model Referral {
  id String @id @default(uuid())
  referrerId String
  refereeEmail String
  status ReferralStatus @default(PENDING)
  createdAt DateTime @default(now())
}

# 2. 创建Server Action
# src/actions/referral.ts
export async function sendReferral(email: string) { ... }

# 3. 连接前端
# src/app/pricing/page.tsx (Line 410-439)
```

**预计时间**: 4-5小时

---

### 10. ⚠️ 性能优化 - 替换<img>为Next.js <Image>

**当前问题**:
- 32个<img>标签警告
- 影响LCP和带宽

**需要优化的文件**:
```
- src/app/about-us/page.tsx
- src/app/success-stories/page.tsx
- src/app/student-care/page.tsx
- src/components/dashboard/views/* (头像)
- src/components/marketing/landing-page.tsx
```

**修复模板**:
```tsx
// Before
<img src={url} alt={alt} />

// After
import Image from 'next/image';
<Image src={url} alt={alt} width={200} height={200} />
```

**预计时间**: 2-3小时

---

## 🟢 Low Priority (后续迭代)

### 11. 📝 内容填充

**需要真实内容的页面**:
- Success Stories (成功案例)
- Study Guides (学习指南)
- Blog Posts (博客文章)
- Student Care (学生关怀)

**预计时间**: 16-20小时 (内容创作)

---


**当前问题**:
- 图谱每次刷新布局都变化

**修复步骤**:
```sql
-- 在Chapter表添加坐标字段
ALTER TABLE "chapters" ADD COLUMN "x" INTEGER;
ALTER TABLE "chapters" ADD COLUMN "y" INTEGER;
```

**预计时间**: 2小时

---

## 📋 上线前终极检查清单

### 代码质量 ✅
- [x] ESLint: 0 errors
- [x] TypeScript: 0 errors
- [ ] Build成功: `pnpm build`
- [ ] 测试通过: `pnpm test`

### 功能完整性
- [ ] 用户注册/登录 ✅
- [ ] 课程浏览 (需修复Mock数据)
- [ ] 题目练习 (需修复Mock数据)
- [ ] 排行榜 (需连接Server Action)
- [ ] 社区讨论 ✅
- [ ] 错题本 ✅
- [ ] 家长端 (需连接Server Action)
- [ ] 支付订阅 (需配置Stripe)

### 数据库
- [ ] 所有migrations已执行
- [ ] 种子数据已填充
- [ ] 备份策略已设置

### 环境配置
- [x] .env.local 配置完整
- [ ] Stripe Keys 已配置
- [x] Supabase Keys 已配置
- [x] Resend API Key 已配置
- [ ] 生产环境变量已准备

### 安全检查
- [ ] API Routes有权限验证
- [ ] Server Actions有用户验证
- [ ] SQL注入防护 (Prisma自动)
- [ ] XSS防护 (React自动)
- [ ] HTTPS强制 (生产环境)

### 性能
- [ ] 首屏加载 < 3秒
- [ ] API响应 < 200ms
- [ ] 图片已优化 (需替换<img>)
- [ ] 代码已分割 (Next.js自动)

### SEO
- [ ] Meta tags完整
- [ ] Sitemap.xml生成
- [ ] Robots.txt配置
- [ ] Open Graph图片

---

## 🎯 推荐实施顺序

### Week 1: Critical Issues (必须完成)
**Day 1-2**: MyCoursesView + QuestionBankView真实数据连接
**Day 3**: LeaderboardView + ParentDashboardView连接
**Day 4**: Stripe配置 + 支付测试
**Day 5**: 数据库种子数据填充

### Week 2: High Priority (强烈建议)
**Day 6-7**: 空状态优化 + Email验证
**Day 8-9**: 内容填充 (Success Stories, Blog)
**Day 10**: 完整功能测试

### Week 3: Polish (打磨)
**Day 11-12**: 性能优化 (<img> → <Image>)
**Day 13**: SEO优化
**Day 14**: 最终测试 + 部署

---

## 📊 上线准备度评分

| 维度 | 当前分数 | 目标分数 | 差距 |
|------|---------|---------|------|
| 代码质量 | 95% | 100% | -5% |
| 功能完整性 | 60% | 95% | -35% |
| 数据真实性 | 60% | 100% | -40% |
| 性能优化 | 70% | 90% | -20% |
| SEO | 50% | 90% | -40% |
| **总体** | **67%** | **95%** | **-28%** |

---

## 🚦 上线建议

### 🔴 不建议上线 (当前状态)
原因:
- 40%功能仍使用Mock数据
- 用户体验不完整
- 支付功能未配置

### 🟡 可以Beta测试 (完成Week 1后)
条件:
- Critical issues全部修复
- 核心功能有真实数据
- 明确告知用户"Beta版本"

### 🟢 可以正式上线 (完成Week 1+2后)
条件:
- 所有Critical + High issues修复
- 功能完整性 > 90%
- 通过完整测试

---

## 📞 需要帮助?

如果需要协助完成任何任务,请告诉我:
1. 你想从哪个任务开始?
2. 需要我生成什么代码?
3. 有什么疑问或不确定的地方?

**预计总工时**: 40-60小时 (1-2周全职开发)
**建议上线时间**: 2周后 (完成Critical + High Priority任务)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
