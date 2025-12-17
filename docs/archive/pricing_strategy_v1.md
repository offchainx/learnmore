# LearnMore Pricing Strategy & Page Design (v1.0)

**Date**: 2025-12-13
**Status**: Draft
**Reference**: TradingView Pricing UI (Dark Mode, High Contrast Columns)

---

## 1. Pricing Structure (定价体系)

采用 **Freemium + 3 Tier Subscription** 模式。
**Billing Cycle**: Monthly / Annually (Save 10%)

| Tier Name | Monthly Price | Annual Price (Monthly Eq.) | Target Audience | Key Value Prop |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | $0 | $0 | 体验用户 / 基础练习 | 基础题库练习，每日有限 AI 尝试。 |
| **Self-Learner** | $60 | $54 | 自律性强的学生 | 完整题库 + 基础 AI 诊断。适合查漏补缺。 |
| **Scholar** | $150 | $135 | **核心用户 (Best Value)** | 完整 AI 体验 (知识图谱+视频弹题)。适合系统性提分。 |
| **Ultimate** | $260 | $234 | 冲刺名校 / 强监管需求 | 无限 AI + 家长实时监控 + 考前冲刺服务。 |

---

## 2. Feature Matrix (权限矩阵)

参考 TradingView 的长列表勾选风格，功能点需细化以体现价值感。

| Feature Category | Feature Item | Free ($0) | Self-Learner ($60) | Scholar ($150) | Ultimate ($260) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Content** | Video Lessons | SD (720p) | HD (1080p) | HD (1080p) | **4K + Offline** |
| | Question Bank | Basic Only | Full Access | Full Access | **Full + Olympiad** |
| | Past Papers | ❌ | Last 3 Years | Last 5 Years | **Last 10 Years** |
| **AI Intelligence** | Diagnostic Report | Basic Score | Score + Weakness | Deep Analysis | **Deep + Trend** |
| | Knowledge Graph | View Only | View Only | **Interactive Nav** | **Interactive Nav** |
| | AI Q&A (Tutor) | 5 / day | 20 / day | **100 / day** | **Unlimited** |
| | Mistake Book | Manual | Auto-Save | **Auto + Smart Push**| **Smart + Print** |
| **Parenting** | Dashboard Access | ❌ | Weekly Email | **App Access** | **Real-time Alert** |
| **Support** | Response Time | Community | 48h Email | 24h Chat | **Priority 1-on-1** |

---

## 3. Referral Mechanism (增长裂变)

**Slogan**: "Learning is better together."
**Logic**: Double-sided Reward (双向奖励)
- **Referrer (Inviter)**: Get **2 Weeks** of their current plan for free.
- **Referee (Invitee)**: Get **2 Weeks** of *Scholar* plan trial immediately.

**UI Implementation**:
- A prominent card below the pricing table.
- Progress bar showing "Refer 2 more friends to unlock 1 month free".

---

## 4. AI Studio Prompt (Page Design)

**Copy the text below to generate the UI:**

```text
Design a sophisticated "Pricing Page" for LearnMore, inspired by TradingView's dark mode aesthetics.

**Layout & Style:**
- **Background**: Deep space blue/black gradient (`bg-[#020617]`).
- **Structure**: 4 Columns (Free, Self-Learner, Scholar, Ultimate).
- **Visuals**: Use neon accent borders (Cyan for Free, Blue for Self-Learner, Purple for Scholar, Gold/Orange for Ultimate).
- **Toggle**: A prominent "Monthly / Annually (Save 10%)" switch at the top.

**Tier Cards (Content):**

1. **Free ($0)**
   - "Essential for trying out."
   - Button: "Get Started" (Outline).
   - Features: Basic Questions, SD Videos, 5 AI chats/day.

2. **Self-Learner ($60/mo)**
   - "For disciplined self-study."
   - Button: "Start Trial" (Outline).
   - Features: HD Videos, Full Question Bank, 20 AI chats/day, Auto-Mistake Book.

3. **Scholar ($150/mo)** -> **Highlight This Column**
   - **Badge**: "Most Popular" / "Best Value".
   - **Style**: Glowing border, slightly elevated.
   - "The complete AI Tutor experience."
   - Button: "Start Free Trial" (Solid Gradient Fill).
   - Features: Knowledge Graph Navigation, 100 AI chats/day, Smart Mistake Push, Parent App Access.

4. **Ultimate ($260/mo)**
   - "For top achievers & full monitoring."
   - Button: "Go Ultimate" (Solid Gold/Orange Fill).
   - Features: 4K Offline Videos, Olympiad Questions, Unlimited AI, Real-time Parent Alerts, Priority Support.

**Feature Comparison List (Below Buttons):**
- Use a long, scrollable list of checkmarks (✔) and crosses (✖) for each tier, similar to TradingView.
- Group features by "Content", "AI Tools", "Parenting", "Support".

**Referral Section (Bottom):**
- A wide card spanning the width.
- Title: "Give 2 Weeks, Get 2 Weeks".
- Input field: "Enter friend's email" + "Invite Button".
- Visual: A gift box icon or handshake illustration.

**Tech Stack:**
- React, Tailwind CSS, Lucide React Icons.
- Use `framer-motion` for the toggle switch and hover effects.
```
