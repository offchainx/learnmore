# 响应式手动调整清单

这份文档是给你手动调页面时直接对照用的。

目标只有两件事：

- 先统一“看哪些尺寸”
- 再统一“看哪些路由”

---

## 1. 尺寸怎么分类

这个项目的真实断点在 [tailwind.config.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/tailwind.config.ts:1)：

- `sm`: `375`
- `md`: `390`
- `lg`: `414`
- `xl`: `428`
- `tablet`: `768`
- `desktop`: `1024`
- `laptop`: `1280`
- `laptop-lg`: `1366`
- `display`: `1440`
- `wide`: `1536`

但你手动调的时候，不要按这么碎的粒度看。直接按下面 5 类就够了。

### A. 手机

建议看：

- `390 x 844`
- `428 x 926`

用途：

- 检查单列是否成立
- 检查 header / bottom tab 是否挡内容
- 检查是否出现页面级横向滚动

### B. 平板竖屏

建议看：

- `768 x 1024`

用途：

- 检查是否应该进入双列
- 检查卡片是否过早并排导致拥挤

### C. 紧凑桌面

建议看：

- `1024 x 900`
- `1120 x 900`

用途：

- 这是你现在最容易出问题的一档
- 检查“宽屏布局是否被硬塞进半屏”
- dashboard / admin / courses / practice 优先看这一档

### D. 常规笔记本

建议看：

- `1280 x 900`
- `1366 x 768`

用途：

- 检查两栏/三栏是否刚好成立
- 检查侧栏、表格、工作区是否开始稳定

### E. 大屏桌面

建议看：

- `1440 x 900`
- `1536 x 960`

用途：

- 检查大屏是否只是“变空”，而不是“变美”
- 检查 max-width、对齐、留白节奏

---

## 2. 推荐检查顺序

不要每个页面把 5 档都看完再下一个。效率太低。

建议顺序：

1. 先用 `1024` 看一遍全部关键页
2. 再用 `390` 看关键移动页
3. 再用 `768` 看中间态
4. 最后用 `1280 / 1440` 做宽屏复核

原因：

- `1024` 最容易暴露“宽屏布局硬塞”
- `390` 最容易暴露横向溢出和按钮遮挡
- `768` 最容易暴露错误分栏

---

## 3. 每个页面要检查什么

每次打开一个页面，只看这 6 件事：

1. 有没有页面级横向滚动
2. 有没有内容被 header / bottom tab / drawer 挡住
3. 有没有过早分栏，导致内容挤压
4. 有没有固定高度，导致下半部分空白过大或内容被裁切
5. 表格/时间轴/对比区是不是只在局部容器内横向滚动
6. 首屏信息密度是否合理，不是“又空又长”

---

## 4. 必查路由

下面这些是你应该优先手调和复查的页面。

---

## 4.1 营销页

优先级：高

- `/`
- `/about-us`
- `/pricing`
- `/subjects`
- `/how-it-works`
- `/student-care`
- `/success-stories`
- `/study-guides`
- `/blog`
- `/help`
- `/contact`

重点：

- hero 大图和文案是否失衡
- 对比表、时间轴、装饰图层是否造成横向问题
- 大块视觉卡片在 `768 / 1024` 是否过高

---

## 4.2 认证与 onboarding

优先级：高

- `/login`
- `/register`
- `/reset-password`
- `/onboarding/legal`
- `/onboarding/profile`

重点：

- 表单和说明区是否在 `768 / 1024` 过早并排
- 预览卡片是否过高
- CTA 是否始终在视口内清楚可见

---

## 4.3 Dashboard 主路径

优先级：最高

- `/dashboard`
- `/dashboard/community`
- `/dashboard/community/new`
- `/dashboard/leaderboard`
- `/dashboard/achievements`
- `/dashboard/settings`
- `/dashboard/settings/notifications`

重点：

- `1024 / 1120` 下是否进入紧凑桌面而不是宽屏拼图
- community / settings 的侧栏是否过宽
- dashboard 首页首屏是否塞得下核心信息

---

## 4.4 Courses

优先级：最高

- `/dashboard/courses`
- `/course/[subjectId]`
- `/course/[subjectId]/[lessonId]`

调试时至少选一个真实课程样本。

重点：

- 主内容和侧栏在 `1024 / 1280` 是否合理分栏
- lesson player 是否出现固定高导致空白或裁切
- 课程目录是否在平板/紧凑桌面下过挤

---

## 4.5 Practice

优先级：最高

- `/dashboard/practice`
- `/dashboard/practice/smart-drill`
- `/dashboard/practice/error-wiper`
- `/dashboard/practice/mock-arena`
- `/dashboard/practice/mock-arena/[examId]`
- `/dashboard/practice/chapter-drill/[chapterId]`
- `/dashboard/practice/past-paper/[paperId]`
- `/dashboard/practice/import`

重点：

- 工作区是否在 `1024` 下还能操作
- 题目区、答题卡、侧栏是否挤压
- 复盘页是否过早变成双栏
- 固定高度编辑区是否还在

---

## 4.6 Admin

优先级：最高

- `/admin`
- `/admin/feedback`
- `/admin/feedback/[id]`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/referrals`
- `/admin/rewards`
- `/admin/vouchers`
- `/admin/content`
- `/admin/content/import`
- `/admin/content/review`
- `/admin/content/review/[questionId]`
- `/admin/content/reports`
- `/admin/content/statistics`

重点：

- 宽表格是不是只在局部滚
- 抽屉宽度在 `1024 / 1280` 是否合适
- 筛选条是否会换行炸裂
- 空状态卡片是否占太高

---

## 5. 动态路由如何检查

有些动态页不需要每条都看，选代表样本即可。

建议：

- 社区帖子：选一个内容长、回复多的帖子
- 课程详情：选一个章节较多的课程
- past paper：选一个内容长、图片多的试卷
- mock arena exam：选一个题量较多的 exam
- admin 用户详情：选一个数据字段较多的用户
- admin content review：选一个题干长、图片多、字段多的题目

---

## 6. 手动调整时的实际工作流

每调一个页面，按这个顺序：

1. 先看 `1024`
2. 修结构问题
3. 再看 `390`
4. 修横向滚动和遮挡
5. 再看 `768`
6. 最后看 `1280 / 1440`

不要上来就在大屏里修细节。

---

## 7. 建议你先从这 12 个页面开始

如果你想最快看到成效，先按这个最小集合调：

- `/dashboard`
- `/dashboard/practice`
- `/dashboard/courses`
- `/dashboard/settings`
- `/admin/feedback`
- `/admin/content/review`
- `/admin/users`
- `/`
- `/pricing`
- `/subjects`
- `/onboarding/profile`
- `/login`

这 12 个页面能覆盖：

- 营销页
- auth / onboarding
- dashboard
- courses
- practice
- admin

---

## 8. 一句话策略

这个项目不要追求“所有尺寸等比例缩小”。

正确做法是：

- 手机：单列
- 平板：谨慎双列
- 紧凑桌面：重排，不硬塞宽屏布局
- 常规桌面以上：再放开完整信息密度
