# Story-042: Referral 推荐系统

**阶段**: Phase 7: Growth & Monetization
**目标**: 实现用户推荐奖励系统，允许付费用户通过推荐码邀请新用户，双方获得会员时长奖励
**预估时间**: 10-12 Hours
**Story Points**: 13
**前置依赖**: 用户认证系统、订阅支付系统
**状态**: 🔴 需求讨论中 (Pending Requirements Confirmation)
**负责人**: _待分配_

---

## 1. Objectives (核心目标)

### 已明确的需求 ✅
- [ ] **推荐码生成**: 每个用户注册时自动生成唯一的推荐码
- [ ] **推荐码验证**: 注册时可输入推荐码，系统验证有效性
- [ ] **推荐人资格**: 只有付费用户（PRO/ULTIMATE）的推荐码才有效
- [ ] **奖励发放**: 被推荐人完成首次付费后，推荐人获得 2 周额外会员时长
- [ ] **Admin 管理**: Admin 可查看所有推荐关系记录，包含详细信息

### 待确认的需求 ❓

#### 1.1 推荐码生成规则
**选项**:
- **Option A**: 系统自动生成 8 位随机码（如 `AB12CD34`），用户不可自定义
- **Option B**: 用户可自定义推荐码（如 `VICTOR2025`），需要敏感词过滤

**决策**: `待用户确认`

---

#### 1.2 推荐码生效条件
**场景 A**: 免费用户注册后的推荐码是否立即可用？
```
用户 Alice 注册 → 获得推荐码 ABC123
此时 Alice 是 STUDENT（免费） → 推荐码 ABC123:
  - Option A: 无效（Bob 使用时提示错误）
  - Option B: 待激活（Alice 升级为 PRO 后自动生效）
```

**场景 B**: 推荐码是否有时效性？
```
Alice（PRO用户）的推荐码 ABC123
如果 Alice 会员到期降级为 STUDENT：
  - Option 1: 推荐码立即失效（推荐人必须是当前付费用户）
  - Option 2: 推荐码依然有效（曾经是付费用户即可）
```

**决策**: `待用户确认`

---

#### 1.3 奖励发放机制

**推荐人奖励** (已明确: 2 周额外时长)
```
问题: 如果推荐人是 PRO（月付 ¥99），被推荐人购买 ULTIMATE（年付 ¥1999）:
  - Option A: 推荐人的 PRO 延长 2 周（不升级等级）
  - Option B: 推荐人升级为 ULTIMATE 2 周
  - Option C: 其他方案
```

**被推荐人奖励** (未明确)
```
  - Option A: 注册后立即获得 1 周 PRO 试用（付费前可体验）
  - Option B: 付费后延长 1 周（如购买 1 个月，实际 5 周）
  - Option C: 不给被推荐人奖励
```

**决策**: `待用户确认`

---

#### 1.4 推荐上限
**问题**: 每个付费用户最多可推荐多少人？

**建议**: 10 人（防止批量刷单）

**决策**: `待用户确认`

---

#### 1.5 推荐记录追踪深度
**一级推荐** (已明确):
```
Alice 推荐 Bob → Alice 获得奖励
```

**多级推荐** (待确认):
```
Alice 推荐 Bob，Bob 推荐 Charlie:
  - Option A: 只记录一级（Alice 不从 Charlie 获得奖励）
  - Option B: 支持二级（Alice 从 Charlie 获得较小奖励，如 1 周）
```

**决策**: `待用户确认`

---

#### 1.6 Admin 管理后台详细需求
**基础展示列** (已明确):
- 推荐人（用户名、邮箱、会员等级）
- 被推荐人（用户名、邮箱、会员等级）
- 推荐码
- 注册时间
- 付费时间
- 状态（PENDING / COMPLETED）
- 奖励发放状态

**额外功能** (待确认):
- [ ] 筛选功能（按状态、时间范围）
- [ ] 导出 CSV
- [ ] 手动触发奖励发放（Webhook 失败时补救）
- [ ] 展示被推荐人累计消费金额

**决策**: `待用户确认`

---

#### 1.7 推荐码分享方式
**基础分享链接** (已明确):
```
https://learnmore.com/register?ref=ABC123
```

**额外功能** (待确认):
- [ ] 生成二维码（方便线下分享）
- [ ] 社交媒体分享按钮（微信、Facebook）
- [ ] 推荐文案模板（一键复制）

**决策**: `待用户确认`

---

#### 1.8 边缘情况处理

**8.1 被推荐人退款**
```
Bob 使用 Alice 推荐码付费 → Alice 获得 2 周奖励
3 天后 Bob 申请退款 → Alice 的奖励:
  - Option A: 保留（已发放不撤回）
  - Option B: 扣除（撤回 2 周）
  - Option C: 标记异常，人工审核
```

**8.2 推荐人降级**
```
Alice（PRO）推荐 5 人，获得 10 周奖励
Alice 会员到期未续费，降级为 STUDENT
已获得的 10 周奖励:
  - Option A: 保留（下次升级时继续使用）
  - Option B: 清零（不续费则失效）
```

**8.3 重复注册**
```
Bob 用 bob@gmail.com + 推荐码 ABC123 注册
账号被封后，用 bob2@gmail.com + 同一推荐码再次注册:
  - Option A: 允许（只要邮箱不同）
  - Option B: 禁止（检测 IP/设备指纹防刷）
```

**决策**: `待用户确认`

---

## 2. Tech Plan (技术方案)

### 2.1 数据库 Schema 扩展

#### 新增表: `Referral` (推荐关系记录)
```prisma
model Referral {
  id            String   @id @default(uuid()) @db.Uuid
  referrerId    String   @map("referrer_id") @db.Uuid
  refereeId     String   @map("referee_id") @db.Uuid
  referralCode  String   @map("referral_code")

  status        ReferralStatus @default(PENDING)
  rewardGranted Boolean  @default(false) @map("reward_granted")
  rewardDate    DateTime? @map("reward_date")

  refereeEmail  String   @map("referee_email")
  refereePaidAt DateTime? @map("referee_paid_at")

  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  referrer User @relation("Referrer", fields: [referrerId], references: [id], onDelete: Cascade)
  referee  User @relation("Referee", fields: [refereeId], references: [id], onDelete: Cascade)

  @@unique([refereeId])
  @@index([referrerId])
  @@index([status])
  @@map("referrals")
}

enum ReferralStatus {
  PENDING
  COMPLETED
  EXPIRED
  CANCELLED
}
```

#### 修改 `User` 表
```prisma
model User {
  // 现有字段...

  referralCode   String?   @unique @map("referral_code") // 改为 unique
  referralCount  Int       @default(0) @map("referral_count")
  referralLimit  Int       @default(10) @map("referral_limit")

  subscriptionTier  UserRole? @map("subscription_tier")
  subscriptionStart DateTime? @map("subscription_start")
  subscriptionEnd   DateTime? @map("subscription_end")

  referralsGiven    Referral[] @relation("Referrer")
  referralsReceived Referral[] @relation("Referee")
}
```

### 2.2 核心功能实现

#### Step 1: 推荐码生成 (注册时)
**文件**: `src/actions/auth.ts`

- 添加 `generateReferralCode()` 函数（使用 `nanoid`）
- 修改 `signupAction`:
  1. 验证推荐码有效性（存在、推荐人是付费用户、未达上限）
  2. 注册成功后生成用户专属推荐码
  3. 创建 `Referral` 记录（status=PENDING）

#### Step 2: 注册表单添加推荐码输入
**文件**: `src/components/business/auth/register-form.tsx`

- 添加 `referralCode` 输入框
- 支持 URL 参数 `?ref=CODE` 自动填充
- 显示奖励说明文案

#### Step 3: 付费成功后发放奖励
**文件**: `src/app/api/webhooks/stripe/route.ts` (新建)

- 监听 `checkout.session.completed` 事件
- 更新用户订阅状态
- 查找待处理的推荐关系
- 发放奖励（推荐人 +2 周，被推荐人视决策而定）
- 更新 `Referral` 记录为 COMPLETED

#### Step 4: 个人设置页展示推荐码
**文件**: `src/components/dashboard/views/SettingsView.tsx`

- 展示用户专属推荐码
- 一键复制推荐链接
- 显示已推荐人数和奖励规则
- 只对付费用户显示

#### Step 5: Admin 管理后台
**文件**: `src/app/dashboard/admin/referrals/page.tsx` (新建)

- 展示所有推荐关系列表
- 显示推荐人、被推荐人、状态、奖励发放情况
- 根据最终决策添加筛选/导出功能

### 2.3 技术依赖
- `nanoid`: 生成推荐码
- Stripe Webhooks: 监听付费事件
- Prisma: 数据库操作

---

## 3. Verification (验证清单)

**基础功能**:
- [ ] 新用户注册时自动生成唯一推荐码
- [ ] 使用无效推荐码注册时显示错误提示
- [ ] 付费用户才能使用推荐码邀请他人（根据最终决策）
- [ ] 被推荐人完成首次付费后，双方自动获得奖励
- [ ] Admin 可查看所有推荐关系
- [ ] 推荐码支持 URL 传参（`?ref=CODE`）

**边缘情况**:
- [ ] 推荐人降级后的行为符合预期
- [ ] 被推荐人退款后的处理符合预期
- [ ] 达到推荐上限后无法继续推荐

**性能**:
- [ ] 推荐码验证 < 200ms
- [ ] Webhook 处理 < 1s

---

## 4. Deliverables (交付物)

- [ ] 数据库 Migration 文件
- [ ] 推荐码生成与验证逻辑（`src/actions/auth.ts`）
- [ ] 注册表单组件（带推荐码输入）
- [ ] Stripe Webhook 处理器
- [ ] 个人设置页推荐板块
- [ ] Admin 管理后台页面
- [ ] 单元测试（推荐码生成、验证逻辑）

---

## 5. Definition of Done

- [ ] 所有 Objectives 完成
- [ ] ESLint 0 errors (`pnpm lint`)
- [ ] TypeScript 0 errors (`pnpm tsc --noEmit`)
- [ ] 单元测试通过 (`pnpm test`)
- [ ] 生产构建成功 (`pnpm build`)
- [ ] 在 Staging 环境测试推荐流程端到端
- [ ] Admin 后台功能验证通过
- [ ] 代码 Review 通过
- [ ] 文档更新（如有 API 变更）

---

## 6. Rollback Plan (回滚方案)

**如果发现严重 Bug**:
1. 回滚数据库 Migration:
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```
2. 移除 Stripe Webhook 配置
3. 隐藏注册表单中的推荐码输入（Feature Flag）

**数据恢复**:
- `Referral` 表可安全删除（不影响核心功能）
- `User.referralCode` 可保留（向后兼容）

---

## 7. Risks & Mitigation (风险与缓解)

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Stripe Webhook 失败导致奖励未发放 | 高 | 添加手动触发功能，Admin 可补发 |
| 推荐码重复（nanoid 冲突） | 低 | 添加重试逻辑（最多 3 次） |
| 批量刷单（机器人注册） | 中 | 设置推荐上限，添加 CAPTCHA |
| 被推荐人退款后的纠纷 | 中 | 明确条款，奖励不可撤回 |

---

## 8. Notes & Learnings (开发笔记)

### 待决策事项清单

**请用户逐一确认以下选项** (复制此清单回复):

```
1. 推荐码生成：
   ☐ Option A: 自动生成 8 位
   ☐ Option B: 用户自定义

2. 推荐码生效条件：
   ☐ Option 1: 必须当前付费
   ☐ Option 2: 曾经付费即可

3. 推荐人奖励（被推荐人购买更高等级时）：
   ☐ Option A: 延长当前等级 2 周
   ☐ Option B: 升级为被推荐人等级 2 周
   ☐ Option C: 其他___________

4. 被推荐人奖励：
   ☐ Option A: 注册后立即 1 周试用
   ☐ Option B: 付费后延长 1 周
   ☐ Option C: 无奖励

5. 推荐上限：
   ☐ 10 人
   ☐ 其他___________

6. 推荐层级：
   ☐ 只记录一级
   ☐ 支持二级（如何奖励___________）

7. Admin 功能需求：
   ☐ 只展示列表
   ☐ + 筛选
   ☐ + 导出 CSV
   ☐ + 手动发放奖励

8. 分享功能：
   ☐ 只提供链接
   ☐ + 二维码
   ☐ + 社交分享按钮

9. 边缘情况：
   9.1 被推荐人退款: ☐ 保留奖励 ☐ 扣除奖励
   9.2 推荐人降级: ☐ 保留奖励 ☐ 清零奖励
   9.3 重复注册: ☐ 允许 ☐ 防刷检测
```

### 估算时间分解
- Schema 扩展: 1h
- Backend 逻辑: 3h
- Webhook 处理: 2h
- Frontend UI: 3h
- Admin 后台: 2h
- 测试 & 调试: 2h
- **总计**: 13h

---

## 9. Related Stories

**依赖**:
- 用户认证系统（已完成）
- 订阅支付系统（需确认 Stripe 集成状态）

**后续**:
- Story-043: 推荐排行榜（展示 Top 推荐人）
- Story-044: 推荐奖励升级（累计推荐 N 人解锁特殊徽章）

---

**🔴 当前状态**: 等待用户确认上述 9 项决策后，开始实施开发
