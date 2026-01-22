# Cursor Git 可视化操作完全指南 🎨

> 专注于 Cursor/VS Code 中的 Git 可视化界面操作
1
---

## 目录

1. [Source Control 面板详解](#1-source-control-面板详解)
2. [Changes (改动) 视图](#2-changes-改动-视图)
3. [Git Graph 插件](#3-git-graph-插件)
4. [GitLens 插件](#4-gitlens-插件)
5. [实战操作演示](#5-实战操作演示)
6. [快捷键速查](#6-快捷键速查)

---

## 1. Source Control 面板详解

### 1.1 打开方式

```
方式1: 点击左侧栏的 Source Control 图标 (树形图标)
方式2: 快捷键 Cmd+Shift+G (Mac) / Ctrl+Shift+G (Windows)
方式3: 命令面板 → "Git: Show Source Control"
```

### 1.2 面板布局详解

```
┌─────────────────────────────────────────────────────────────┐
│ SOURCE CONTROL                                    [↻] [•••] │  ← 标题栏
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📝 Message                                                  │  ← Commit 消息输入框
│ ┌─────────────────────────────────────────────────────┐   │
│ │ feat: add user login                                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [✓ Commit] [v]                                     [Sync]  │  ← 操作按钮
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Changes (3)                                          [+] ▼  │  ← 未暂存区域
│   M  src/App.tsx                                    [+] [↻] │
│   M  src/utils.ts                                   [+] [↻] │
│   U  src/newFile.tsx                               [+] [↻] │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Staged Changes (1)                                   [-] ▼  │  ← 已暂存区域
│   M  src/components/Login.tsx                      [-] [↻] │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Merge Changes (2)                                        ▼  │  ← 冲突区域
│   C  src/config.ts                                     [✓]  │
│   C  package.json                                      [✓]  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 文件状态图标详解

| 图标 | 含义 | 说明 |
|------|------|------|
| **M** | Modified | 文件被修改 |
| **D** | Deleted | 文件被删除 |
| **A** | Added | 新增的文件（已 stage） |
| **U** | Untracked | 未跟踪的文件 |
| **C** | Conflict | 冲突的文件 |
| **R** | Renamed | 重命名的文件 |
| **?** | Unknown | 未知状态 |

### 1.4 操作按钮详解

#### **标题栏按钮**

```
[↻] Refresh       - 刷新状态
[•••] More        - 更多操作菜单
  ├─ Pull
  ├─ Push
  ├─ Fetch
  ├─ Checkout to...
  ├─ Create Branch...
  └─ ...
```

#### **主操作按钮**

```
[✓ Commit]        - 提交暂存的改动
  ├─ Cmd+Enter 快捷键
  └─ 下拉菜单：
      ├─ Commit
      ├─ Commit & Push
      ├─ Commit & Sync
      └─ Commit Staged

[v] 下拉菜单      - Commit 选项
[Sync Changes]    - 同步（= pull + push）
```

#### **文件操作按钮**

```
[+]  Stage Changes           - 暂存改动
[-]  Unstage Changes         - 取消暂存
[↻]  Discard Changes         - 丢弃改动
[✓]  Accept Current/Incoming - 接受冲突解决方案
```

### 1.5 右键菜单详解

在文件上右键可以看到：

```
Open File                              - 打开文件
Open Changes                           - 查看改动对比
Open File (HEAD)                       - 查看上次提交的版本
Stage Changes                          - 暂存改动
Discard Changes                        - 丢弃改动
Stash Changes                          - 暂存到 stash
Reveal in Explorer                     - 在文件树中定位
Copy Path                              - 复制路径
Copy Relative Path                     - 复制相对路径
```

---

## 2. Changes (改动) 视图

### 2.1 打开 Diff 视图

**方式1: 点击文件**
- 在 Source Control 面板点击任意修改的文件
- 自动打开 diff 视图

**方式2: 命令面板**
- `Cmd+Shift+P` → "Git: Open Changes"

**方式3: 快捷键**
- 选中文件后按 `Enter`

### 2.2 Diff 视图布局

```
┌────────────────────────────────────────────────────────────────────┐
│ ← src/App.tsx (Working Tree) ↔ src/App.tsx (HEAD)            [×]  │
├─────────────────────────────┬──────────────────────────────────────┤
│  Working Tree (左侧)         │  HEAD (右侧)                         │
│  你当前的改动                │  上次提交的版本                       │
├─────────────────────────────┼──────────────────────────────────────┤
│ 1  import React from 'react'│ 1  import React from 'react'         │
│ 2  import { useState } from │ 2                                    │  ← 新增行（绿色）
│ 3                            │ 3  function App() {                  │
│ 4  function App() {          │ 4    return <div>Hello</div>         │  ← 删除行（红色）
│ 5    const [user, setUser] = │ 5  }                                 │
│ 6    return <div>           │ 6                                    │  ← 修改行（黄色/橙色）
│ 7      {user.name}           │ 7                                    │
│ 8    </div>                  │ 8                                    │
│ 9  }                         │ 9                                    │
└─────────────────────────────┴──────────────────────────────────────┘
```

### 2.3 颜色含义

| 颜色 | 区域 | 含义 |
|------|------|------|
| 🟢 **绿色背景** | 左侧 | 新增的行 |
| 🔴 **红色背景** | 右侧 | 删除的行 |
| 🟡 **黄色/橙色** | 两侧 | 修改的行 |
| 🔵 **蓝色竖线** | 边缘 | 有改动的区块 |

### 2.4 Diff 视图操作

#### **导航快捷键**

```
F7                下一个改动
Shift+F7          上一个改动
Cmd+K Cmd+D       跳到下一个差异
Cmd+K Cmd+Shift+D 跳到上一个差异
```

#### **编辑操作**

```
Cmd+Z             撤销改动
Cmd+Shift+Z       重做改动
```

#### **工具栏按钮**

```
┌─────────────────────────────────────────┐
│ [<] [>] [↻] [◉] [≡]                   │
│  |   |   |   |   |                     │
│  |   |   |   |   └─ Ignore Whitespace │
│  |   |   |   └───── Toggle Word Wrap   │
│  |   |   └───────── Revert Change      │
│  |   └───────────── Next Change         │
│  └───────────────── Previous Change     │
└─────────────────────────────────────────┘
```

### 2.5 Stage 部分改动 (Split Staging)

**场景：** 一个文件有多处改动，但只想提交其中一部分

**步骤：**

1. 打开文件的 diff 视图
2. 选中想要 stage 的代码行
3. 右键 → "Stage Selected Ranges"
4. 或者点击行号旁边的 `+` 按钮

**示例：**

```
src/App.tsx (Working Tree)

 1  import React from 'react'
 2  import { useState } from 'react'  ← 选中这几行
 3                                     ← 右键 → Stage Selected
 4  function App() {
 5    const [user, setUser] = useState(null)
 6    return <div>Hello</div>         ← 不选，不会被 stage
 7  }
```

结果：
- 第 2-3 行进入 "Staged Changes"
- 第 6 行保留在 "Changes"

---

## 3. Git Graph 插件

### 3.1 安装

```
1. 打开扩展面板 (Cmd+Shift+X)
2. 搜索 "Git Graph"
3. 点击 Install
4. 重启 Cursor
```

### 3.2 打开 Git Graph

```
方式1: 点击底部状态栏的 "Git Graph" 按钮
方式2: Source Control 面板 → 右上角 Graph 图标
方式3: Cmd+Shift+P → "Git Graph: View Git Graph"
```

### 3.3 Git Graph 界面详解

```
┌──────────────────────────────────────────────────────────────────────┐
│ Git Graph - learn_more_v1.0                              [↻] [⚙]  [×]│
├──────────────────────────────────────────────────────────────────────┤
│ [All Branches ▼] [Search...] [Filters ▼]                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ * 3c47f63 (HEAD → main, origin/main) Merge: Story042.2.5           │
│ |\                                                     2 hours ago   │
│ | * 2f65cd6 Merge: Admin管理后台                       3 hours ago   │
│ | * 292eec1 Merge: 功能实现                            4 hours ago   │
│ * | 17ca43a Merge: Web功能                             4 hours ago   │
│ |/                                                                   │
│ * e4dba24 完成 A2                                       1 day ago    │
│ |                                                                    │
│ * 1111773 Update docs                                   2 days ago   │
│ |                                                                    │
│ * 9b173e7 (origin/feature/ui) UI finalization          3 days ago   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Commit Details: 3c47f63                                              │
├──────────────────────────────────────────────────────────────────────┤
│ Author:   Victor <victor@example.com>                                │
│ Date:     2025-01-22 14:30:00                                        │
│ Parents:  17ca43a, 2f65cd6                                           │
│                                                                      │
│ Message:                                                             │
│ Merge: Story042.2.5 - 最终功能                                        │
│                                                                      │
│ Changed Files (3):                                                   │
│   M  src/components/SettingsView.tsx                    (+50, -20)   │
│   A  src/components/ReferralSection.tsx                (+120, -0)    │
│   M  package.json                                       (+1, -0)     │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.4 图形符号详解

| 符号 | 含义 |
|------|------|
| `*` | Commit 点 |
| `│` | 分支线（垂直） |
| `\` | 分支分叉（向下） |
| `/` | 分支合并（向上） |
| `─` | 分支线（水平） |

**分支关系示例：**

```
线性历史：
* A
|
* B
|
* C

分叉：
* A
|\
| * B (feature)
|
* C (main)

合并：
* A
|\
| * B
| * C
* | D
|/
* E (merge commit)
```

### 3.5 颜色含义

| 颜色 | 含义 |
|------|------|
| 🔵 **蓝色** | main/master 分支 |
| 🟢 **绿色** | 其他本地分支 |
| 🟡 **黄色** | 远程分支 |
| 🔴 **红色** | HEAD (当前位置) |
| 🟣 **紫色** | Tags |

### 3.6 标签含义

```
(HEAD → main)           - 当前在 main 分支
(origin/main)           - 远程 main 分支的位置
(tag: v1.0.0)           - 版本标签
(HEAD → main, origin/main) - 本地和远程同步
```

### 3.7 右键菜单操作

在 commit 上右键：

```
Checkout...                      - 切换到该 commit
Create Branch...                 - 基于该 commit 创建分支
Cherry Pick...                   - 挑选该 commit 到当前分支
Revert...                        - 撤销该 commit
Reset Current Branch to this...  - 重置到该 commit
  ├─ Soft Reset
  ├─ Mixed Reset
  └─ Hard Reset
Copy Commit Hash                 - 复制 commit ID
Copy Commit Subject              - 复制 commit 标题
Copy Commit Message              - 复制完整 commit 消息
View Commit Details              - 查看详情
View Diff                        - 查看改动
```

在分支标签上右键：

```
Checkout Branch                  - 切换到该分支
Merge into Current Branch...     - 合并该分支到当前
Rebase Current Branch on...      - Rebase 当前分支到该分支
Delete Branch...                 - 删除该分支
Push Branch...                   - 推送该分支
Pull Branch...                   - 拉取该分支
```

### 3.8 过滤和搜索

**分支过滤器：**

```
[All Branches ▼]
  ├─ All Branches               - 显示所有分支
  ├─ Current Branch Only        - 只显示当前分支
  └─ Show/Hide Specific...      - 选择特定分支
```

**搜索框：**

```
[Search...]
  ├─ 搜索 commit message
  ├─ 搜索作者名
  ├─ 搜索 commit hash
  └─ 支持正则表达式
```

**高级过滤器：**

```
[Filters ▼]
  ├─ Date Range                 - 时间范围
  ├─ Author                     - 作者筛选
  ├─ Committer                  - 提交者筛选
  └─ File Path                  - 文件路径筛选
```

---

## 4. GitLens 插件

### 4.1 安装

```
1. 扩展面板 (Cmd+Shift+X)
2. 搜索 "GitLens"
3. Install
4. 配置 (可选)
```

### 4.2 核心功能

#### **行内 Blame (代码归属)**

```typescript
// 你的代码
import React from 'react';  ← Victor, 2 days ago: feat: add React import

function App() {            ← Victor, 2 days ago: feat: add React import
  return <div>Hello</div>;  ← Alex, 3 hours ago: fix: update message
}
```

**悬浮查看详情：**
- 鼠标悬浮在灰色文字上
- 弹出完整 commit 信息

**快捷键：**
- `Cmd+Shift+L` - 切换 Blame 显示

#### **文件历史视图**

**打开方式：**
```
右键文件 → GitLens → Open File History
```

**界面：**
```
┌──────────────────────────────────────────────────────────────┐
│ File History - src/App.tsx                                   │
├──────────────────────────────────────────────────────────────┤
│ * 3c47f63  fix: update UI           Victor    2 hours ago    │
│ * 2f65cd6  feat: add login          Alex      1 day ago      │
│ * 292eec1  refactor: clean code     Victor    3 days ago     │
│ * 17ca43a  feat: initial commit     Victor    1 week ago     │
└──────────────────────────────────────────────────────────────┘
```

点击任意 commit → 查看该文件在那个时间点的样子

#### **比较功能**

**打开方式：**
```
右键文件 → GitLens → Compare File with...
  ├─ Previous Revision           - 和上一个版本对比
  ├─ Working Tree                - 和当前工作区对比
  ├─ HEAD                        - 和最新 commit 对比
  ├─ Branch or Tag...            - 和指定分支/标签对比
  └─ Revision...                 - 和指定 commit 对比
```

#### **Commit Graph (升级版)**

**打开方式：**
```
侧边栏 → GitLens 图标 → Commit Graph
```

**比 Git Graph 更强的功能：**
- 更丰富的 commit 详情
- 内联文件差异
- 更强的搜索功能
- 集成 Pull Request 信息（如果连接了 GitHub）

### 4.3 侧边栏面板

```
┌──────────────────────────────────────┐
│ GITLENS                              │
├──────────────────────────────────────┤
│ ▼ REPOSITORIES (1)                   │
│   ▼ learn_more_v1.0                  │
│     ▶ Branches (2)                   │
│     ▶ Remotes (1)                    │
│     ▶ Stashes (0)                    │
│     ▶ Tags (3)                       │
│     ▶ Worktrees (1)                  │
│                                      │
│ ▼ FILE HISTORY                       │
│   * 3c47f63  2 hours ago             │
│   * 2f65cd6  1 day ago               │
│                                      │
│ ▼ LINE HISTORY                       │
│   (当前光标行的历史)                  │
│                                      │
│ ▼ COMMITS                            │
│   ▼ Branches                         │
│   ▼ Remotes                          │
│   ▼ Tags                             │
│                                      │
│ ▼ SEARCH & COMPARE                   │
│   ⊕ Compare References...            │
│   🔍 Search Commits...               │
└──────────────────────────────────────┘
```

### 4.4 快捷键

```
Cmd+Shift+L         切换行内 Blame
Alt+B               切换 File Blame
Cmd+Shift+G B       打开 Branches 视图
Cmd+Shift+G C       打开 Commits 视图
Cmd+Shift+G H       打开 File History
Cmd+Shift+G R       打开 Repositories 视图
```

---

## 5. 实战操作演示

### 5.1 场景1: 提交代码的完整流程

**步骤1: 查看改动**

```
1. 打开 Source Control (Cmd+Shift+G)
2. 看到 Changes (3):
   M  src/App.tsx
   M  src/utils.ts
   U  src/newFile.tsx
```

**步骤2: 查看具体改了什么**

```
3. 点击 src/App.tsx
4. 打开 diff 视图
5. 左右对比查看改动
6. 确认改动正确
```

**步骤3: Stage 改动**

```
7. 如果想全部提交：
   点击 Changes 旁边的 [+] 按钮

8. 如果只想提交部分文件：
   点击每个文件旁边的 [+] 按钮

9. 如果只想提交文件的部分改动：
   在 diff 视图中选中代码
   右键 → Stage Selected Ranges
```

**步骤4: 写 Commit Message**

```
10. 在顶部的 Message 输入框输入：
    feat: add user login feature

    - Implement JWT authentication
    - Add login form
    - Set up API endpoints

11. 遵循格式：<type>: <description>
```

**步骤5: 提交**

```
12. 点击 [✓ Commit] 按钮
    或按 Cmd+Enter

13. 如果想直接推送：
    点击 [Commit] 旁边的下拉箭头
    选择 "Commit & Push"
```

**步骤6: 推送到远程**

```
14. 如果只点了 Commit：
    点击 [Sync Changes] 按钮
    或使用命令面板：Git: Push
```

### 5.2 场景2: 查看分支历史和切换分支

**使用 Git Graph：**

```
1. 点击底部状态栏的 "Git Graph"
2. 看到完整的分支图
3. 找到你想切换的分支或 commit
4. 右键 → Checkout
5. 确认切换
```

**使用 Source Control：**

```
1. 点击底部状态栏的分支名（例如 "main"）
2. 弹出分支列表
3. 选择目标分支
4. 确认切换

或者：
Source Control → [•••] → Checkout to...
```

### 5.3 场景3: 解决合并冲突

**步骤1: 冲突发生**

```
1. 执行 git merge 或 git pull
2. Source Control 面板出现 "Merge Changes (2)"
3. 看到冲突文件：
   C  src/config.ts
   C  package.json
```

**步骤2: 打开冲突文件**

```
4. 点击 src/config.ts
5. 看到冲突标记：

   <<<<<<< HEAD (Current Change)
   const API_URL = 'https://api.example.com';
   =======
   const API_URL = 'https://new-api.example.com';
   >>>>>>> feature/new-api (Incoming Change)
```

**步骤3: 解决冲突**

**方式1: 点击快速操作按钮**

```
在冲突区域上方会显示：
[Accept Current Change] [Accept Incoming Change] [Accept Both Changes] [Compare Changes]

点击需要的操作：
- Current = 保留你的改动
- Incoming = 接受别人的改动
- Both = 两者都保留
- Compare = 在 diff 视图中对比
```

**方式2: 手动编辑**

```
6. 删除冲突标记
7. 保留正确的代码：
   const API_URL = 'https://new-api.example.com';
```

**步骤4: 标记为已解决**

```
8. 保存文件
9. 点击文件旁边的 [+] 按钮
   或右键 → Stage Changes
```

**步骤5: 完成合并**

```
10. 所有冲突文件都解决并 stage 后
11. 点击 [✓ Commit] 完成合并
    (commit message 会自动生成)
```

### 5.4 场景4: 撤销改动

**撤销未 Stage 的改动：**

```
1. 在 Changes 区域找到文件
2. 点击文件旁边的 [↻] 按钮
3. 或右键 → Discard Changes
4. 确认操作
```

**撤销已 Stage 的改动：**

```
1. 在 Staged Changes 区域找到文件
2. 点击文件旁边的 [-] 按钮
3. 文件移回 Changes 区域
4. 再点击 [↻] 丢弃改动
```

**撤销已 Commit 的改动：**

```
方式1: 使用 Git Graph
1. 打开 Git Graph
2. 找到想撤销的 commit
3. 右键 → Revert
4. 自动创建反向 commit

方式2: 使用命令面板
1. Cmd+Shift+P
2. "Git: Undo Last Commit"
3. 选择撤销方式（soft/hard）
```

### 5.5 场景5: 查看某个文件的历史改动

**使用 GitLens：**

```
1. 右键文件
2. GitLens → Open File History
3. 看到该文件的所有 commit
4. 点击任意 commit 查看当时的代码
```

**使用 Git Graph：**

```
1. 打开 Git Graph
2. 在 Filters 中输入文件路径
3. 只显示涉及该文件的 commits
```

**比较两个版本：**

```
1. 右键文件
2. GitLens → Compare File with...
3. 选择 "Revision..."
4. 输入 commit hash 或选择分支
5. 查看差异
```

---

## 6. 快捷键速查

### 6.1 Source Control 操作

```
Cmd+Shift+G           打开 Source Control 面板
Cmd+Enter             Commit (提交暂存的改动)
Cmd+K Cmd+U           Unstage (取消暂存)
Cmd+K Enter           Commit & Sync
```

### 6.2 导航和查看

```
F7                    下一个改动
Shift+F7              上一个改动
Cmd+K Cmd+D           跳到下一个差异
Cmd+K Cmd+Shift+D     跳到上一个差异
Cmd+Shift+P           命令面板（输入 git 查看所有命令）
```

### 6.3 分支操作

```
Cmd+Shift+P → "Git: Create Branch..."
Cmd+Shift+P → "Git: Checkout to..."
Cmd+Shift+P → "Git: Merge Branch..."
Cmd+Shift+P → "Git: Delete Branch..."
```

### 6.4 GitLens 快捷键

```
Cmd+Shift+L           切换行内 Blame
Alt+B                 切换 File Blame
Cmd+Shift+G H         打开 File History
```

### 6.5 自定义快捷键

**如何设置：**

```
1. Cmd+K Cmd+S (打开快捷键设置)
2. 搜索 "git"
3. 找到想自定义的命令
4. 双击设置快捷键
```

**推荐自定义：**

```
Git: Push                → Cmd+Shift+P P
Git: Pull                → Cmd+Shift+P L
Git: Fetch               → Cmd+Shift+P F
Git: Sync                → Cmd+Shift+P S
Git Graph: View          → Cmd+Shift+P G
```

---

## 7. 小技巧和最佳实践

### 7.1 提高效率的技巧

**1. 使用 Stage Selected Ranges**
- 不要一次性 stage 整个文件
- 把不相关的改动分开提交
- 让 commit 历史更清晰

**2. 利用 Git Graph 快速导航**
- 用搜索功能快速找 commit
- 用右键菜单进行操作，不用记命令

**3. 使用 GitLens 行内 Blame**
- 快速知道谁改了这行代码
- 理解代码的历史背景
- 发现问题时知道找谁

**4. 善用 Stash**
- 临时切换分支时用 stash
- 不用提交未完成的代码

**5. 经常 Fetch**
- 保持对远程仓库的了解
- 避免冲突

### 7.2 视觉化理解分支

**在 Git Graph 中观察：**

```
良好的分支结构：
* (main)
|\
| * (feature/a)
| |
| * (feature/a)
|/
* (main)
|\
| * (feature/b)
| |
| * (feature/b)
|/
* (main)

混乱的分支结构（避免）：
* ─┐ ┌─┐
│ │ │ │
├─┤ │ │
│ └─┤ │
│   └─┤
└─────*
```

### 7.3 commit 消息最佳实践

**在 Message 输入框中：**

```
✅ 好的 commit message:
feat: add user authentication

- Implement JWT token generation
- Add login and register endpoints
- Set up password hashing

❌ 不好的 commit message:
update code
fix
wip
asdfasdf
```

---

## 8. 疑难问题解决

### 8.1 Diff 视图显示不正确

**解决方案：**
```
1. Cmd+Shift+P
2. "Developer: Reload Window"
3. 或检查设置：
   "diffEditor.ignoreTrimWhitespace": false
```

### 8.2 Git Graph 不显示所有分支

**解决方案：**
```
1. 点击 [All Branches ▼]
2. 确保选择了 "All Branches"
3. 或点击 [↻] 刷新
```

### 8.3 GitLens 行内 Blame 看不到

**解决方案：**
```
1. Cmd+Shift+L 切换显示
2. 或检查设置：
   "gitlens.currentLine.enabled": true
```

### 8.4 Source Control 面板文件不更新

**解决方案：**
```
1. 点击 Source Control 面板的 [↻] 刷新按钮
2. 或 Cmd+Shift+P → "Git: Refresh"
```

---

## 9. 总结：可视化操作流程图

```
日常工作流：

1. 打开项目
   ↓
2. [Cmd+Shift+G] 打开 Source Control
   ↓
3. 查看 Changes
   ↓
4. [点击文件] 查看 Diff
   ↓
5. [+] Stage Changes
   ↓
6. [输入 Message] 写 commit 说明
   ↓
7. [Cmd+Enter] Commit
   ↓
8. [Sync] 推送到远程

查看历史：

1. [Git Graph 按钮] 打开图形视图
   ↓
2. 查找 commit / 分支
   ↓
3. [右键] 执行操作
   ↓
4. Checkout / Merge / Cherry-pick

解决冲突：

1. 发现冲突文件
   ↓
2. [点击文件] 打开冲突视图
   ↓
3. [Accept Current/Incoming] 或手动编辑
   ↓
4. [+] Stage 已解决的文件
   ↓
5. [Commit] 完成合并
```

---

**🎉 恭喜！你现在掌握了 Cursor 中所有 Git 可视化操作！**

**记住：**
- Source Control = 日常操作
- Git Graph = 查看历史
- GitLens = 代码归属
- Diff View = 详细对比

**实践是最好的老师，现在就开始用吧！** 💪
