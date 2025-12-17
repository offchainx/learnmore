# Story-022: UI Design Iteration (AI Studio)

**状态**: Backlog ⚪
**优先级**: P0
**目标**: 利用 Google AI Studio 的生成能力，根据产品经理确定的详细内容架构，快速迭代 Landing Page、Dashboard 及所有 Marketing Pages 的视觉设计。

---

## Part A: Landing Page (官网首页)

**目标**: 建立信任，展示核心价值，引导转化（注册/试用）。

**Prompt (Copy to AI Studio)**:
```text
Design a high-converting Landing Page for "LearnMore", an AI-powered adaptive learning platform for middle school students.

Style: Dark mode (slate-950 background), clean, futuristic but educational. Use blue, indigo, and emerald gradients.

Sections to include:
1. Hero Section:
   - Headline: "Not just practice, but your AI Personal Tutor."
   - Subheadline: "Knowledge Graph-based adaptive learning that turns every minute into progress."
   - CTA Buttons: "Get Free Diagnosis Report" (Primary, glowing) and "Watch Demo" (Secondary).
   - Visual: Right side placeholder for a 3D dynamic knowledge graph animation.

2. Pain Points & Solution (3-Column Cards):
   - Card 1: "Stuck on scores?" -> "AI Attribution Analysis" (Pinpoint why you missed).
   - Card 2: "Parents can't help?" -> "24/7 AI Companion" (Instant guidance).
   - Card 3: "Lost in textbooks?" -> "Adaptive Learning Path" (Personalized roadmap).

3. Comparison Table (Traditional vs LearnMore):
   - Traditional: One-size-fits-all, Passive listening, Delayed feedback.
   - LearnMore: Personalized, Interactive, Real-time diagnosis.

4. Success Stories (Social Proof):
   - Stats: "Avg Grade Boost 25+", "Efficiency +40%".
   - Testimonials: A slider showing student success stories (e.g., "From Fail to A*") and parent reviews ("Peace of mind").

5. Footer:
   - Links: Products (Student/Parent App), Resources (Blog, Past Papers), About Us, Legal (Privacy, Terms).
   - Contact: "Contact Us" button and phone number.

Tech stack: React, Tailwind CSS, Lucide React Icons. Use 'framer-motion' classes for scroll animations.
Generate a single-file React component.
```

---

## Part B: Dashboard (App Core - Sidebar Navigation)

**目标**: 对应 App 左侧导航栏的核心功能模块。行动优先，沉浸式体验。

### 1. Dashboard Home (指挥中心)

**Prompt (Copy to AI Studio)**:
```text
Design the "Dashboard Home" for LearnMore with a strict 4-layer "Action-First" layout.

**Layout Structure:**

1.  **Row 1: Core Drive (Status & Inspiration)**
    -   **Main Card (Left/Center, ~70% width): "Today's Mission"**.
        -   Headline: "Today's Focus".
        -   Logic: This list is the *Daily Execution* of the "Weakness Sniper" (Layer 4).
        -   Content: 3 specific tasks (e.g., "Fix 3 Errors in Math", "Learn: Force Vectors").
        -   Visual: Gamified list with check circles and XP rewards.
        -   **Refinement**: Give each mission item a slightly lighter background (e.g., `bg-white/5` or `bg-slate-800`) and a subtle border to make them pop as clickable cards.
    -   **Side Card (Right, ~30% width): "Daily Inspiration"**.
        -   Content: A motivational quote or a "Streak Flame" visual (e.g., "12 Days on Fire!").

2.  **Row 2: Data Dashboard (The Stats)**
    -   **Group A: Effort (Warm Colors)** -> Study Time (12.5h), Streak (12 Days), XP (Lvl 12).
    -   **Group B: Performance (Cool Colors)** -> Questions Done (342), Accuracy (88%), Mistakes Pending (24).
    -   *Visual Note*: Don't just list 6 boxes. Visually group them or use subtle dividers to separate "Input (Effort)" from "Output (Results)".

3.  **Row 3: Positioning & Context (Process vs. Outcome)**
    -   **Left Column (Subject Progress - The "Input" - ~65% Width):**
        -   List of subjects (Math, Science, etc.) with progress bars.
        -   **Key Feature "Gap Tag"**: Next to the progress bar, show a small tag: "↓ 5% vs Avg" or "↑ 10% vs Avg".
        -   **Key Feature "Boost Button" (CRITICAL)**: Add a prominent **"Boost" button** (small "Zap" or "Play" icon) on the far right of *each* subject row. This is the primary action trigger.
    -   **Right Column (Rank & Positioning - The "Output" - ~35% Width):**
        -   "Class/Grade Ranking" Card.
        -   Show Percentile Rank (e.g., Top 15%) and Mock Exam Average.
        -   This serves as the *stimulus* to use the "Boost" buttons on the left.

4.  **Row 4: Deep Dive & Actions (Scroll down)**
    -   **"My Learning Path"**:
        -   **Continue Learning**: Quick access to the last visited lesson.
        -   **Course List**: Detailed breakdown of chapters.
        -   **Weakness Sniper (The Inventory)**: A comprehensive list of ALL weak concepts.
        -   **Refinement**: Make the "Fix" buttons **Solid Filled** (e.g., `bg-red-500 text-white`) to convey urgency ("Fix this NOW").

Generate a single-file React component using Tailwind CSS.
```

### 2. Lessons (Study Center)

**Prompt (Copy to AI Studio)**:
```markdown
Role: Senior Frontend Developer & UX Designer
Context: Design the "Lessons" page (Study Center). This is the content hub. Stack: React, Tailwind CSS, Lucide Icons.

**Core Layout:**
- **Top**: Subject Navigation Tabs (Horizontal Scroll).
- **Body**: 3 Main Tabs: [Curriculum] [Smart Review] [My Notebook].

**Detailed Requirements & Interactions:**

1. **Subject Navigation (Top Tabs)**
   - **Horizontal Scroll**: Use `overflow-x-auto` for the tab list.
   - **Visual Cue**: Add a right-side "fade-out" gradient overlay (`from-transparent to-slate-950`) to indicate more subjects are available.

2. **Tab 1: Curriculum (The Learning Path)**
   - **List**: Accordion-style chapter list.
   - **Type Icons**: Distinguish content types clearly:
     - Video: `<PlayCircle className="text-blue-400" />`
     - Reading: `<FileText className="text-emerald-400" />`
     - Quiz: `<HelpCircle className="text-orange-400" />`
   - **"Continue" Indicator**: Highlight the next actionable item with a distinct "Continue" button or glow effect.

3. **Tab 2: Smart Review (The Review Engine)**
   - **Action First**: Place a large, inviting **"Start Today's Review Session"** button at the top.
   - **Interaction**: Clicking this button should trigger a **Full-Screen Overlay** (Immersive Mode) showing the review plan.
   - **Priority Queue**: List items with clear tags: "Urgent" (Red), "Reinforce" (Orange), "Mastered" (Green).

4. **Tab 3: My Notebook (Knowledge Base)**
   - **Tools**: Include a Search Bar (`<Search />`) and Filter Tabs (All, Notes, Bookmarks).
   - **Card Design**: Show Note Title, Date, and a "Go to Context" link.

5. **Sidebar (Right Panel)**
   - **Study Goal**: Make the "Target Grade: A*" card **Interactive** (Hover effects + "View Roadmap >").
   - **Live Class**: Handle **Empty States**. If no class, show: "No classes this week. Review your Error Book?" with a link.

Generate the React code focusing on these interactions.
```

### 3. Practice (练习中心)

**目标**: 从单一的“刷题列表”升级为“综合训练中心”。区分同步练习、查漏补缺和考前冲刺三种场景。

**Design Principles**:
1.  **Three Training Modes**: 顶部三大入口（章节练习、错题突击、全真模考）。
2.  **Hexagon Knowledge Hive**: 用“蜂巢热力图”替代简陋的雷达图，展示知识点掌握情况。
3.  **Gamified Chapter List**: 章节列表加入“星级”、“AI标签”和“高频考点”标记。
4.  **Mock Exam Independence**: 模考是跨章节的，不能作为 Chapter 3 存在，需独立展示。

**Prompt (Copy to AI Studio)**:
```text
Design the "Practice Center" page for LearnMore.

**Layout Structure:**

1.  **Header & Filters**:
    -   Subject Selector (Tabs): IGCSE Math, Physics, Chemistry.
    -   *Action*: Smooth transition between subjects.

2.  **Main Content Area (Left/Center - ~70% Width)**:
    -   **Section 1: Training Modes (The "Command Center")**:
        -   3 Large Cards in a horizontal row:
            1.  **Smart Drill**: "Chapter-based adaptive practice." (Visual: Book/Pen icon).
            2.  **Error Wiper**: "Clear your 24 pending mistakes." (Visual: Eraser/Shield icon, Red accent).
            3.  **Mock Arena**: "Full-length past year papers." (Visual: Trophy/Timer icon).
    
    -   **Section 2: Chapter Map (The "Curriculum")**:
        -   List of chapters (e.g., "01: Foundations", "02: Algebra").
        -   **Visual Enhancements**:
            -   **Mastery Stars**: Show 0/3 stars instead of just a checkmark.
            -   **AI Tags**: Add small badges like "Exam Hotspot" (Fire icon) or "Weakness" (Red dot) next to relevant chapters.
            -   **Action**: A clear "Start" button on the right.
    
    -   **Section 3: Mock Exams (Independent Section)**:
        -   A separate section below chapters for "Past Year Papers 2023-2024".

3.  **Sidebar (Right - ~30% Width)**:
    -   **Widget 1: Knowledge Hive (Proficiency Map)**:
        -   *Replace the Radar Chart*. Use a **"Hexagon Grid" (Honeycomb)** design.
        -   Each hexagon represents a sub-topic. Color them Green (Strong) to Red (Weak) to create a heatmap effect.
        -   **Refinement**: Scale up the hexagons or add more "gray/locked" hexagons to form a larger, more impressive grid that fills the card better visually.
    -   **Widget 2: Exam Forecast**:
        -   Show a predicted grade (e.g., "A*") with a small trend line graph (sparkline) showing improvement over time.
    -   **Widget 3: Weakness Quick Fix**:
        -   A compact list of top 3 weak concepts.
        -   **Refinement**: For each weakness, add an explicit **"Fix" Button** (e.g., a small filled button or a Play icon) on the right side.

**Style**:
-   Dark mode (Slate-950).
-   High contrast accents for the "Training Modes".
-   Professional data visualization for the Hexagon Map.

Generate a single-file React component using Tailwind CSS.
```

### 4. Leaderboard (Gamified S.P.A.K. System)

**Prompt (Copy to AI Studio)**:
```markdown
Role: Senior UI/UX Engineer & Gamification Expert
Task: Redesign the Leaderboard page to implement the "S.P.A.K." (Status, Progression, Action, Kick-off) game mechanics.
Goal: Create a "Flywheel Effect" where users are motivated to learn AND contribute to the community to rank up.

**Core Game Mechanics (Context):**
- **Cycle**: Bi-Weekly Seasons (14 Days). Seasonal XP resets; Lifetime XP stays.
- **Tiers**: Bronze -> Silver -> Gold -> Platinum -> Diamond -> Challenger (Top 100).
- **Zones**: Promotion (Top 15%), Safe (Mid 65%), Demotion (Bottom 20%).
- **XP Sources**: Learning (Lessons/Quizzes), **Weakness Killing (Error Book)**, and **Community (Answering questions/Upvoting)**.

**Detailed UI Layout Requirements:**

1.  **Header: The Journey & Context (Full Width)**
    -   **Tier Progress Bar**: A horizontal roadmap at the very top.
        -   Visual: `Bronze -- Silver -- [GOLD] -- Platinum -- Diamond`
        -   Highlight current tier. Show progress text: "Top 12% - 150 XP to Promotion Zone".
    -   **Season Banner**: A distinct banner below the roadmap showing the **Current Season Theme**.
        -   Example: "🔥 Sniper Season: 2x XP for Error Book Kills!" or "🤝 Helper Season: 2x XP for Community Answers".
        -   Include a countdown: "Season ends in 05d 12h".

2.  **Main Content Area (3+1 Layout)**
    -   **Left Column (The Arena - 70% Width):**
        -   **Podium**: Retain the 3D/Glowing avatars for Top 3 (Gold/Silver/Bronze styles).
        -   **The List**:
            -   **Zone Coloring**: Subtly tint the background of rows to indicate status:
                -   Promotion Zone (Rank 1-5): Soft Green tint/border.
                -   Demotion Zone (Bottom): Soft Red tint/warning icon.
            -   **Sticky User Row**: Ensure the user's own row is always visible at the bottom if scrolled out of view.
        -   **Visuals**: Use glassmorphism and high-contrast text.

    -   **Right Column (The HUD - 30% Width):**
        -   **Widget 1: My Performance**:
            -   A Donut Chart showing XP breakdown: "70% Study" vs "30% Community".
        -   **Widget 2: Daily Quests (The "Action" Trigger)**:
            -   List actionable tasks to earn XP *now*.
            -   Example:
                -   "Kill 1 Error (+40 XP)" [Go]
                -   "Upvote 3 Helpful Posts (0/3) (+6 XP)" [Go]
                -   "Answer a Question (+150 XP)" [Go]
        -   **Widget 3: Rival Watch**:
            -   "Only 50 XP behind [User Name]. Catch up!"

**Style & Tech**:
-   Dark Mode (Slate-950).
-   Use Tailwind CSS for gradients and layout.
-   Use Lucide Icons for task types (Zap for Study, MessageCircle for Community).

Generate the `LeaderboardClient.tsx` component.
```

### 5. Student Hub (Community)

**目标**: 从通用的“论坛”升级为“互助学习社区”。强调实时陪伴感和问题解决效率。

**Design Principles**:
1.  **Discord-style Live Rooms**: 增加头像堆叠 (Avatar Pile) 和状态显示，营造“有人陪伴”的氛围。
2.  **Distinct Post Types**: 视觉上区分“求助帖”(高亮/醒目)、“笔记帖”(卡片风)和“成就帖”(金色/发光)。
3.  **Gamified Contribution**: 排行榜强调“已解决问题数”而非简单的点赞数。
4.  **AI Assistant**: 对无人回答的问题提供 "Ask AI" 选项。

**Prompt (Copy to AI Studio)**:
```text
Design the "Student Hub" (Community) page for LearnMore.

**Layout Structure:**

1.  **Left Column: Feed (Content Stream)**
    -   **Input Area**: "Share your thought..." with AI-suggested tags below.
    -   **Filters**: Highlight **"Unanswered"** (e.g., with a red dot or distinct color) to encourage help.
    -   **Post Card Variations**:
        -   **Question (The Priority)**: Distinct background (e.g., `bg-blue-900/20`) or left border accent. If unanswered > 1 hour, show a button: "Ask AI for Solution".
        -   **Note (The Resource)**: Clean card style, maximizing image/content readability.
        -   **Achievement (The Celebration)**: Subtle gold glow/border, emphasizing the success story.
        -   *Common Elements*: User info, timestamp, upvote/reply/share actions.

2.  **Right Column: Sidebar Widgets**
    -   **Widget 1: Live Study Rooms (Discord Vibe)**:
        -   List active rooms (e.g., "Late Night Math", "Lo-Fi Focus").
        -   **Visual**: Show a "Pile" of 3-4 user avatars for each room to show activity.
        -   **Status**: "🟢 12 Studying Now".
        -   **Action**: "Join Room" button.
    -   **Widget 2: Top Contributors**:
        -   Rank top students.
        -   **Metric**: specific "Questions Solved: 124" (not just votes).
        -   **Badges**: Show icons like "Math Wizard" next to names.
    -   **Widget 3: Trending Topics**:
        -   List of popular hashtags (#MidtermPrep, #Calculus).

**Style**:
-   Dark mode.
-   Community-focused, warm but professional.
-   Use clear visual distinctions for different post types.

Generate a single-file React component using Tailwind CSS.
```

### 6. Settings (配置中心)

**目标**: 不仅是功能配置，更是“个性化学习体验”的控制台。核心亮点是 AI 性格定制和家长连接。

**Design Principles**:
1.  **Split Layout**: 左侧垂直导航，右侧内容面板，避免长滚动。
2.  **AI Personality**: 可视化选择 AI 导师风格（严厉/温柔/引导），增加产品的“人味”。
3.  **Parent Link**: 简单直观的二维码/邀请码机制，连接家长端。
4.  **Localization**: 显眼的语言切换选项 (English/中文/Malay)。

**Prompt (Copy to AI Studio)**:
```text
Design the "Settings" page for LearnMore.

**Layout Structure:**

1.  **Left Sidebar (Navigation)**:
    -   Menu items: Profile, Account & Security, **AI Learning Config**, Notifications, Subscription.
    -   Visual: Clean vertical list, active state highlighted with a blue accent.

2.  **Right Content Panel (Dynamic)**:

    -   **Section A: Profile & Language (Top)**
        -   Avatar upload & Nickname.
        -   **Language Selector**: Prominent toggle or dropdown (English / 中文 / Malay).
        -   "Study Goal": Input field for daily target (e.g., "45 mins/day").

    -   **Section B: AI Learning Config (The Highlight)**
        -   **"Choose Your AI Tutor"**:
            -   3 Cards representing personalities:
                1.  **Encouraging (Default)**: "Always supportive and patient." (Visual: Friendly Robot Icon).
                2.  **Socratic**: "Asks questions to guide you." (Visual: Owl/Glasses Icon).
                3.  **Strict**: "High standards, direct feedback." (Visual: Clipboard/Whistle Icon).
        -   **Difficulty Calibration**: A slider from "Foundational" to "Olympiad".
        -   **Curriculum**: Dropdown (IGCSE CIE, IGCSE Edexcel, UEC).

    -   **Section C: Account & Parent Link**
        -   **"Parent Connection"**:
            -   Status: "Not Connected" (Red dot).
            -   Action: "Generate Invite Code" button (shows a large alphanumeric code like 'X9-K2P').
            -   Description: "Link parent account to sync progress reports."

    -   **Section D: Preferences**
        -   Theme Toggle (Dark/Light).
        -   Notification Switches (Daily Reminder, Weekly Report).

**Style**:
-   Dark mode consistent with Dashboard.
-   Make the "AI Tutor" selection visually engaging (card selection style).
-   **Critical**: Ensure content cards are WIDE (`w-full max-w-4xl`) to fill the screen space.

Generate a single-file React component using Tailwind CSS.
```

---

## Part C: Marketing Pages (顶部导航子页面)

**目标**: 深度说服，展示专业性。All-in-One Scrollytelling 模式。

**1. How It Works (Product & AI Integrated Tour)**

**Prompt (Copy to AI Studio)**:
```text
Design a "How It Works" page using scrollytelling for the 5-step AI Learning Loop:
1. Assess (Diagnostic Radar Chart).
2. Plan (Knowledge Graph Path).
3. Learn (Video + Attention Heatmap).
4. Practice (Adaptive Difficulty Curve).
5. Review (Ebbinghaus Forgetting Curve).
Style: Dark mode, tech-inspired micro-interactions.
```

**2. Subjects (Curriculum & Roadmap)**

**Prompt (Copy to AI Studio)**:
```text
Design a "Subjects" page:
1. **Timeline Hero**: Junior Middle (UEC) -> IGCSE -> SPM -> University.
2. **Current Focus**: Grid of 7 UEC Junior subjects with "Preview" buttons.
3. **Knowledge Continuum**: Visual explaining how knowledge maps across different syllabuses.
```

**3. Pricing (服务报价)**

**Prompt (Copy to AI Studio)**:
```text
Design a "Pricing Page" inspired by TradingView (Dark Mode):
- 4 Tiers: Free, Self-Learner, Scholar (Highlighted/Best Value), Ultimate.
- Toggle: Monthly / Annually (-10%).
- Comparison Table: Detailed checkmarks feature list.
- Referral Section: "Give 2 Weeks, Get 2 Weeks".
```

**4. About Us (关于我们)**

**Prompt (Copy to AI Studio)**:
```text
Design an "About Us" page:
- Mission: "Personalized education for all."
- Timeline: Past (Founding), Present (Launch), Future (AI Teachers).
- Team: Grid of photos.
- Join Us: CTA.
```

---

## Part D: Trust & Content Pages

**1. Success Stories**
**Prompt**: "Beyond the Scoreboard" - Focus on personal transformation stories, video grid, and impact stats.

**2. Blog / Newsroom**
**Prompt**: Modern CMS style (like Medium). Categories: Product Updates, Learning Tips, News.

**3. Study Guide**
**Prompt**: "7-Day Onboarding Challenge". Gamified roadmap (Day 1 to Day 7) with deep links to app features.

---

## Part E: Legal & CSR Pages

**1. Legal Hub**
**Prompt**: Sidebar nav for Privacy Policy, Terms, and AI Disclaimer.

**2. LearnMore Impact (CSR)**
**Prompt**: "Education for All". Financial Aid program info and NGO partnerships.

---

## Part G: Architecture & Refactoring (架构重构与国际化)

**目标**: 在功能页面开发完成后，统一代码结构，提取公共组件，并全面实施多语言支持 (i18n)。

### 1. Refactored Folder Structure Plan (架构重构)

**Prompt (Copy to AI Studio)**:
```text
Role: Senior React Architect.

We have generated several page components (Dashboard, Practice, Community, Settings) individually. Now, I need you to **review and refactor the entire codebase structure** to make it production-ready.

**Refactored Folder Structure Plan**:
/
├── components/
│   ├── ui/                # Atomic Design Elements (Reusable)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Tabs.tsx       # [NEW] Generic Tab Controller
│   │   └── Badge.tsx      # [NEW] Status Indicators/Tags
│   ├── layout/            # Layout Shells
│   │   ├── Navbar.tsx
│   │   └── DashboardLayout.tsx # [NEW] Sidebar & Mobile Menu Logic
│   └── dashboard/         # Dashboard Specific Features
│       ├── views/         # Full Page Views (MyCourses, Settings, etc.)
│       └── widgets/       # Small Widgets (DailyInspiration, StatCards)
├── contexts/              # Global State
│   └── AppContext.tsx     # [NEW] Theme, Language, User State
├── hooks/
│   └── useApp.ts          # [NEW] Hook to consume AppContext
├── pages/                 # Route Targets
│   └── Dashboard.tsx      # Cleaned up, uses DashboardLayout
└── utils/                 # Constants, Helpers

**Task**:
Please analyze the current code and provide the **Code for the Shared Components (Button, Card, Layout)** and the **AppContext**. Don't rewrite all pages yet, just set up the foundation.
```

### 2. Full Localization (i18n Implementation) (国际化实施)

**Prompt (Copy to AI Studio)**:
```text
Now that the structure is clean, let's implement **Full Localization (i18n)**.

**Requirement**:
1.  **Dictionary System**: Create a `translations.ts` (or similar) file containing dictionary objects for `en`, `zh` (Chinese), and `ms` (Malay).
2.  **Context**: Create a `LanguageContext` that:
    -   Stores the `currentLang` state.
    -   Provides a `t(key)` function to retrieve text.
    -   Persists the choice in `localStorage`.
3.  **Implementation**:
    -   Go through **ALL** existing pages (Dashboard, Practice, Community, Settings).
    -   Replace **ALL** hardcoded English text with dynamic `{t('dashboard.welcome')}` calls.
    -   **Crucial**: Ensure the "Language Selector" in the Settings page *actually works* and instantly updates the UI language across the entire app.

**Deliverables**:
-   `LanguageContext.tsx`
-   `translations.ts` (with full translations for existing pages)
-   Updated Page Components using the translation hooks.
```

---

## 交付物 (Deliverables)

- 将 AI Studio 生成的代码保存在 `ai_studio_iterations/` 目录中。
- 确认设计符合预期后，进入 Story-023 进行整合。