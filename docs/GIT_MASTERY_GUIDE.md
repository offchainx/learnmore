# Git 实战完全指南 🚀

> 从零开始掌握Git - 原理、命令、工作流、可视化操作全攻略

---

## 目录

1. [Git 核心原理](#1-git-核心原理)
2. [分支管理](#2-分支管理)
3. [核心命令详解](#3-核心命令详解)
4. [Cursor/VS Code 可视化操作](#4-cursorvs-code-可视化操作)
5. [实战场景与决策树](#5-实战场景与决策树)
6. [高级技巧](#6-高级技巧)
7. [常见问题与解决方案](#7-常见问题与解决方案)
8. [最佳实践 Checklist](#8-最佳实践-checklist)

---

## 1. Git 核心原理

### 1.1 Git 是什么？

Git 是一个**分布式版本控制系统**，可以理解为：
- **时光机** - 可以回到任何历史版本
- **平行宇宙** - 可以同时开发多个功能（分支）
- **协作工具** - 多人可以同时工作而不冲突

### 1.2 三个核心区域

```
┌─────────────────────────────────────────────────────────────┐
│                      远程仓库 (Remote)                        │
│                    origin/main, origin/dev                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ git push ↑
                           │ git pull/fetch ↓
┌──────────────────────────┴──────────────────────────────────┐
│                    本地仓库 (Repository)                      │
│                        .git 目录                              │
│              存储所有提交历史和分支信息                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ git commit ↑
                           │ git reset ↓
┌──────────────────────────┴──────────────────────────────────┐
│                    暂存区 (Staging Area)                     │
│                      准备提交的文件                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ git add ↑
                           │ git restore --staged ↓
┌──────────────────────────┴──────────────────────────────────┐
│                   工作区 (Working Directory)                 │
│                      你正在编辑的文件                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Git 对象模型

Git 存储的核心是 3 种对象：

```
Commit (提交)
  ├─→ Tree (目录结构)
  │     ├─→ Blob (文件内容)
  │     └─→ Blob (文件内容)
  └─→ Parent Commit (父提交)
```

**示例：**
```
commit 3c47f63  ← 你看到的 commit ID
Author: Victor
Date: 2025-01-22
Message: "Merge: Story042.2.5"

包含：
- 项目文件树的快照
- 作者信息
- 时间戳
- 指向上一个 commit 的指针
```

### 1.4 分支的本质

**分支只是一个指向 commit 的指针！**

```
         A---B---C  (main)
              \
               D---E  (feature/login)
```

- `main` 指向 commit C
- `feature/login` 指向 commit E
- `HEAD` 指向当前所在的分支

**创建分支 = 创建一个新指针，不复制任何文件！**

---

## 2. 分支管理

### 2.1 本地分支 vs 远程分支

| 类型 | 显示格式 | 位置 | 作用 |
|------|---------|------|------|
| **本地分支** | `main`, `feature/login` | 你的电脑 | 你直接工作的分支 |
| **远程分支** | `origin/main`, `origin/feature/login` | GitHub/GitLab | 远程仓库的镜像 |
| **远程跟踪分支** | `main → origin/main` | 你的电脑 | 记录远程分支状态 |

### 2.2 分支关系图解

```
你的电脑                              GitHub
┌─────────────────┐                  ┌─────────────────┐
│ 本地分支         │                  │ 远程分支         │
│                 │                  │                 │
│ main ●──────────┼──track───────────┼─→ origin/main ● │
│                 │                  │                 │
│ feature/login ● │                  │                 │
│   (未 push)     │                  │                 │
│                 │                  │                 │
│ origin/main ●   │  ← fetch/pull ── │   origin/main ● │
│  (远程镜像)      │                  │                 │
└─────────────────┘                  └─────────────────┘
```

### 2.3 分支操作速查表

```bash
# 查看分支
git branch              # 本地分支
git branch -r           # 远程分支
git branch -a           # 所有分支
git branch -vv          # 查看跟踪关系

# 创建分支
git branch feature/new-ui           # 创建但不切换
git checkout -b feature/new-ui      # 创建并切换
git switch -c feature/new-ui        # 同上（推荐新语法）

# 切换分支
git checkout main                   # 切换到 main
git switch main                     # 同上（推荐新语法）

# 删除分支
git branch -d feature/old           # 安全删除（已合并）
git branch -D feature/old           # 强制删除（未合并）

# 重命名分支
git branch -m old-name new-name     # 重命名

# 推送分支到远程
git push origin feature/new-ui      # 推送到远程
git push -u origin feature/new-ui   # 推送并设置跟踪关系

# 删除远程分支
git push origin --delete feature/old
```

---

## 3. 核心命令详解

### 3.1 提交流程 (add → commit → push)

```bash
# 场景：你修改了 3 个文件，想提交

# 步骤1: 查看状态
git status
# 输出：
# modified: src/App.tsx
# modified: src/utils.ts
# modified: README.md

# 步骤2: 添加到暂存区
git add src/App.tsx src/utils.ts    # 添加指定文件
# 或
git add .                            # 添加所有文件
# 或
git add -p                           # 交互式添加（推荐）

# 步骤3: 提交到本地仓库
git commit -m "feat: add user login feature"

# 步骤4: 推送到远程
git push origin main
```

### 3.2 获取远程更新 (fetch vs pull)

#### **fetch - 安全的获取**
```bash
git fetch origin

# 发生了什么？
# 1. 从 GitHub 下载最新的 commits
# 2. 更新 origin/main 指针
# 3. 不改变你的工作区和当前分支
```

#### **pull - fetch + merge**
```bash
git pull origin main

# 等价于：
git fetch origin
git merge origin/main
```

#### **对比图解**

```
Before fetch/pull:

你的电脑:                GitHub:
main: A---B---C         origin/main: A---B---C---D---E
              ↑ HEAD

After fetch:

你的电脑:                GitHub:
main: A---B---C         origin/main: A---B---C---D---E
      ↑ HEAD
origin/main: A---B---C---D---E
  (镜像更新了)

After pull:

你的电脑:                GitHub:
main: A---B---C---D---E  origin/main: A---B---C---D---E
                  ↑ HEAD
```

**什么时候用哪个？**
- `git fetch` - 当你想先看看远程有什么更新
- `git pull` - 当你确定要直接合并远程更新

### 3.3 合并 (merge)

#### **Fast-Forward Merge (快进合并)**

```bash
# 场景：main 没有新提交，直接"快进"到 feature 分支

Before:
main:    A---B
              \
feature:       C---D

After merge:
main:    A---B---C---D
                     ↑
              feature ↑

git checkout main
git merge feature     # Fast-forward
```

#### **Three-Way Merge (三方合并)**

```bash
# 场景：main 和 feature 都有新提交

Before:
main:    A---B---C
              \
feature:       D---E

After merge:
main:    A---B---C---F (merge commit)
              \     /
feature:       D---E

git checkout main
git merge feature --no-ff  # 创建 merge commit
```

#### **Merge 冲突处理**

```bash
# 1. 尝试合并
git merge feature

# 2. 冲突发生！
# 输出: CONFLICT (content): Merge conflict in src/App.tsx

# 3. 查看冲突文件
git status

# 4. 打开文件，看到：
<<<<<<< HEAD
console.log('main branch version');
=======
console.log('feature branch version');
>>>>>>> feature

# 5. 手动解决：删除标记，保留需要的代码
console.log('merged version');

# 6. 标记为已解决
git add src/App.tsx

# 7. 完成合并
git commit
```

### 3.4 重置 (reset)

```bash
# reset 的三种模式

# --soft: 只移动 HEAD，保留暂存区和工作区
git reset --soft HEAD~1
# 用途：撤销 commit，但保留改动，可以重新 commit

# --mixed (默认): 移动 HEAD，重置暂存区，保留工作区
git reset HEAD~1
# 用途：撤销 commit 和 add，但改动还在

# --hard: 移动 HEAD，重置暂存区和工作区
git reset --hard HEAD~1
# 用途：完全撤销，改动全部丢失！⚠️ 危险
```

**图解：**

```
Before reset:
HEAD → main → C
               ↑
Staging: [changes]
Working: [changes]

After --soft HEAD~1:
HEAD → main → B
Staging: [changes from C]  ← 还在
Working: [changes from C]  ← 还在

After --mixed HEAD~1:
HEAD → main → B
Staging: []               ← 清空了
Working: [changes from C]  ← 还在

After --hard HEAD~1:
HEAD → main → B
Staging: []               ← 清空了
Working: []               ← 清空了
```

### 3.5 Cherry Pick (挑选提交)

```bash
# 场景：只想要某个分支的特定 commit

main:    A---B---C
              \
feature:       D---E---F
                   ↑ 只想要 E

# 操作
git checkout main
git cherry-pick <E的commit-id>

# 结果
main:    A---B---C---E'
              \
feature:       D---E---F
```

**实际例子：**

```bash
# 1. 在 feature 分支找到你想要的 commit
git log feature --oneline
# 输出: 5c74ae9 feat: add mastery system

# 2. 切换到 main
git checkout main

# 3. 挑选这个 commit
git cherry-pick 5c74ae9

# 4. 如果有冲突，解决后：
git add .
git cherry-pick --continue
```

---

## 4. Cursor/VS Code 可视化操作

### 4.1 Source Control 面板 (左侧栏)

```
┌─────────────────────────────────────┐
│ SOURCE CONTROL                      │
├─────────────────────────────────────┤
│ Changes (3)                    ↓    │  ← 未暂存的改动
│   M  src/App.tsx                    │
│   M  src/utils.ts                   │
│   ?  src/newFile.ts                 │
│                                     │
│   [+] Stage All Changes             │  ← 点击=git add .
│                                     │
│ Staged Changes (0)             ↓    │  ← 已暂存的改动
│                                     │
│ Message: feat: add login       📝   │  ← Commit message
│ [✓] Commit                          │  ← 点击=git commit
│ [↑] Push                            │  ← 点击=git push
└─────────────────────────────────────┘
```

**图标含义：**
- `M` = Modified (修改)
- `D` = Deleted (删除)
- `A` = Added (新增)
- `U` = Untracked (未跟踪)
- `C` = Conflict (冲突)
- `R` = Renamed (重命名)

**操作技巧：**

1. **查看改动对比**
   - 点击文件 → 打开 diff 视图（左右对比）

2. **Stage 单个文件**
   - 点击文件旁边的 `+` 按钮

3. **Stage 部分改动**
   - 打开文件 diff 视图
   - 点击行号旁边的 `Stage Selected Ranges`

4. **撤销改动**
   - 右键文件 → `Discard Changes`

### 4.2 Git Graph (时间线视图)

**如何打开：**
1. 安装 "Git Graph" 插件
2. 点击底部状态栏的 "Git Graph" 按钮
3. 或命令面板 (Cmd+Shift+P) → "Git Graph: View Git Graph"

**图形解读：**

```
┌─────────────────────────────────────────────────────────┐
│ * 3c47f63 (HEAD → main, origin/main) Merge: Story042  │
│ |\                                                      │
│ | * 2f65cd6 Merge: Admin管理后台                        │
│ | * 292eec1 Merge: 功能实现                             │
│ * | 17ca43a Merge: Web功能                             │
│ |/                                                      │
│ * e4dba24 完成 A2                                       │
│ * 1111773 Update docs                                  │
└─────────────────────────────────────────────────────────┘
```

**符号含义：**
- `*` = Commit 点
- `|` = 分支线
- `/`, `\` = 分支合并/分叉
- `(HEAD → main)` = 当前位置
- `(origin/main)` = 远程分支位置

**常用操作：**
- 右键 commit → `Checkout` (切换到该 commit)
- 右键 commit → `Cherry Pick` (挑选该 commit)
- 右键 commit → `Revert` (撤销该 commit)
- 右键分支 → `Merge into current branch` (合并分支)

### 4.3 GitLens 插件 (超强增强)

**安装后的功能：**

1. **行内 Blame (代码归属)**
   ```typescript
   console.log('Hello');  // Victor, 2 days ago: feat: add logging
   ```

2. **文件历史**
   - 右键文件 → `Open File History`
   - 查看该文件的所有 commit 历史

3. **Commit Graph**
   - 侧边栏 → GitLens → Commit Graph
   - 更强大的可视化分支图

4. **比较功能**
   - 右键文件 → `Compare File with...`
   - 可以和任意 commit/branch 对比

### 4.4 Changes 视图详解

**Diff 视图布局：**

```
┌────────────────────┬────────────────────┐
│  Working Tree      │  HEAD              │  ← 左边是修改后，右边是修改前
│  (你的改动)         │  (上次提交)         │
├────────────────────┼────────────────────┤
│ 1  function login() │ 1  function login() │
│ 2    console.log(); │ 2    alert();       │  ← 红色=删除
│ 3    fetch('/api') │ 3                   │  ← 绿色=新增
└────────────────────┴────────────────────┘
```

**颜色含义：**
- 🟢 绿色 = 新增的行
- 🔴 红色 = 删除的行
- 🟡 黄色/橙色 = 修改的行

**导航快捷键：**
- `F7` = 下一个改动
- `Shift+F7` = 上一个改动
- `Cmd+Z` = 撤销改动

---

## 5. 实战场景与决策树

### 5.1 场景1: 开始新功能开发

```
你在 main 分支，想开发新功能 "用户登录"

┌─────────────────────────────────────────┐
│ 1. 确保 main 是最新的                    │
└─────────────────┬───────────────────────┘
                  ↓
           git checkout main
           git pull origin main
                  ↓
┌─────────────────────────────────────────┐
│ 2. 创建新分支                            │
└─────────────────┬───────────────────────┘
                  ↓
    git checkout -b feature/user-login
                  ↓
┌─────────────────────────────────────────┐
│ 3. 开发功能 (修改代码)                   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. 提交改动                              │
└─────────────────┬───────────────────────┘
                  ↓
           git add .
           git commit -m "feat: add user login"
                  ↓
┌─────────────────────────────────────────┐
│ 5. 推送到远程                            │
└─────────────────┬───────────────────────┘
                  ↓
    git push -u origin feature/user-login
                  ↓
┌─────────────────────────────────────────┐
│ 6. 在 GitHub 创建 Pull Request          │
└─────────────────────────────────────────┘
```

### 5.2 场景2: 合并别人的代码

```
main 分支有新代码，你的分支需要同步

┌─────────────────────────────────────────┐
│ 你在 feature/login 分支                  │
└─────────────────┬───────────────────────┘
                  ↓
    问：是否有未提交的改动？
                  ↓
         ┌────────┴────────┐
         │ 有              │ 没有
         ↓                 ↓
   git stash         (继续下一步)
         ↓                 ↓
         └────────┬────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 获取最新的 main                          │
└─────────────────┬───────────────────────┘
                  ↓
        git checkout main
        git pull origin main
                  ↓
┌─────────────────────────────────────────┐
│ 回到你的分支                             │
└─────────────────┬───────────────────────┘
                  ↓
    git checkout feature/login
                  ↓
┌─────────────────────────────────────────┐
│ 合并 main 到你的分支                     │
└─────────────────┬───────────────────────┘
                  ↓
        git merge main
                  ↓
    问：是否有冲突？
                  ↓
         ┌────────┴────────┐
         │ 有              │ 没有
         ↓                 ↓
   解决冲突           合并完成
   git add .              ↓
   git commit        恢复 stash
         ↓            (如果有)
         └────────┬────────┘
                  ↓
              完成同步
```

### 5.3 场景3: 代码写错了，想撤销

```
问：改动在哪个阶段？

┌─────────────────────────────────────────┐
│ 1. 还没 git add (在工作区)               │
└─────────────────┬───────────────────────┘
                  ↓
          git restore <file>
          或 git checkout <file>
                  ↓
            改动完全丢失

┌─────────────────────────────────────────┐
│ 2. 已经 git add (在暂存区)               │
└─────────────────┬───────────────────────┘
                  ↓
       git restore --staged <file>
                  ↓
          回到工作区状态
          然后用方法1撤销

┌─────────────────────────────────────────┐
│ 3. 已经 git commit (在本地仓库)          │
└─────────────────┬───────────────────────┘
                  ↓
    问：是否已经 git push？
                  ↓
         ┌────────┴────────┐
         │ 没有            │ 已经
         ↓                 ↓
   git reset --soft    git revert <commit>
   HEAD~1              (创建反向commit)
   或 git reset HEAD~1
         ↓                 ↓
     可以重新提交       推送 revert commit

┌─────────────────────────────────────────┐
│ 4. 已经 git push (在远程仓库)            │
└─────────────────┬───────────────────────┘
                  ↓
    ⚠️ 不能用 reset！会影响其他人
                  ↓
        git revert <commit>
        git push origin <branch>
```

### 5.4 场景4: Pull Request 工作流

```
┌─────────────────────────────────────────┐
│ 1. Fork 或 Clone 项目                    │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. 创建功能分支                          │
└─────────────────┬───────────────────────┘
                  ↓
    git checkout -b feature/my-feature
                  ↓
┌─────────────────────────────────────────┐
│ 3. 开发 + 提交                           │
└─────────────────┬───────────────────────┘
                  ↓
    多次 git add + git commit
                  ↓
┌─────────────────────────────────────────┐
│ 4. 推送到远程                            │
└─────────────────┬───────────────────────┘
                  ↓
    git push origin feature/my-feature
                  ↓
┌─────────────────────────────────────────┐
│ 5. 在 GitHub 创建 PR                     │
└─────────────────┬───────────────────────┘
                  ↓
    点击 "Compare & pull request"
    填写 PR 描述
    点击 "Create pull request"
                  ↓
┌─────────────────────────────────────────┐
│ 6. Code Review (等待审核)                │
└─────────────────┬───────────────────────┘
                  ↓
    审核者提出修改意见
                  ↓
┌─────────────────────────────────────────┐
│ 7. 修改代码并推送                        │
└─────────────────┬───────────────────────┘
                  ↓
    git add .
    git commit -m "fix: address review comments"
    git push origin feature/my-feature
                  ↓
    (PR 自动更新)
                  ↓
┌─────────────────────────────────────────┐
│ 8. PR 被合并                             │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 9. 清理本地分支                          │
└─────────────────┬───────────────────────┘
                  ↓
    git checkout main
    git pull origin main
    git branch -d feature/my-feature
```

### 5.5 场景5: 切换环境/分支

```
问：当前有未提交的改动吗？

         ┌────────┴────────┐
         │ 有              │ 没有
         ↓                 ↓
                     直接切换
方案A: 提交改动          ↓
    git add .        git checkout <branch>
    git commit -m "wip"
    git checkout <branch>

方案B: 暂存改动 (推荐)
    git stash
    git checkout <branch>

    (回来后恢复)
    git checkout <original-branch>
    git stash pop

方案C: 强制丢弃 (⚠️危险)
    git checkout -f <branch>
```

---

## 6. 高级技巧

### 6.1 Stash (暂存工作区)

```bash
# 场景：你正在开发功能A，突然需要紧急修复 bug B

# 1. 暂存当前改动
git stash
# 或带消息
git stash save "WIP: feature A half done"

# 2. 切换到修复分支
git checkout hotfix/bug-b

# 3. 修复完成后，回到原分支
git checkout feature/a

# 4. 恢复暂存的改动
git stash pop           # 恢复并删除 stash
# 或
git stash apply         # 恢复但保留 stash

# 5. 查看所有 stash
git stash list
# 输出：
# stash@{0}: WIP: feature A half done
# stash@{1}: WIP: feature C

# 6. 恢复特定 stash
git stash apply stash@{1}

# 7. 删除 stash
git stash drop stash@{0}
git stash clear         # 删除所有
```

### 6.2 Rebase (变基)

**Merge vs Rebase 对比：**

```bash
# Merge 方式
main:    A---B---C-------F (merge commit)
              \         /
feature:       D---E---

# Rebase 方式
main:    A---B---C
                  \
feature:           D'---E' (commits 被"移动"了)
```

**使用方法：**

```bash
# 1. 在你的分支上
git checkout feature/login

# 2. Rebase 到 main
git rebase main

# 3. 如果有冲突，解决后：
git add <resolved-file>
git rebase --continue

# 4. 如果搞砸了，放弃 rebase
git rebase --abort

# 5. 推送 (需要强制推送)
git push -f origin feature/login
```

**什么时候用 Rebase？**
- ✅ 你的分支还没 push（只在本地）
- ✅ 你想要一个干净的线性历史
- ❌ 分支已经被其他人使用（不要 rebase 公共分支！）

### 6.3 Interactive Rebase (交互式变基)

```bash
# 修改最近 3 个 commit
git rebase -i HEAD~3

# 打开编辑器：
pick abc1234 feat: add login
pick def5678 fix: typo
pick ghi9012 feat: add logout

# 可以做的操作：
# pick = 保留这个 commit
# reword = 保留，但修改 commit message
# edit = 保留，但停下来让你修改
# squash = 合并到上一个 commit
# fixup = 合并到上一个 commit，丢弃 message
# drop = 删除这个 commit

# 例：合并后两个 commit
pick abc1234 feat: add login
squash def5678 fix: typo
squash ghi9012 feat: add logout

# 保存后，会打开新编辑器让你写合并后的 message
```

### 6.4 Reflog (找回丢失的 commit)

```bash
# 场景：你执行了 git reset --hard，后悔了

# 1. 查看所有操作历史
git reflog

# 输出：
# 3c47f63 HEAD@{0}: reset: moving to HEAD~1
# abc1234 HEAD@{1}: commit: feat: add login
# def5678 HEAD@{2}: commit: fix: bug

# 2. 找到你想恢复的 commit
git reset --hard abc1234

# 或者
git checkout HEAD@{1}
```

### 6.5 Worktree (多分支同时工作)

```bash
# 场景：你想同时在多个分支上工作，但不想频繁切换

# 1. 创建新的 worktree
git worktree add ../my-project-feature feature/new-ui
# 在 ../my-project-feature 目录创建 feature/new-ui 分支的工作区

# 2. 查看所有 worktree
git worktree list

# 3. 在新目录工作
cd ../my-project-feature
# 这里是 feature/new-ui 分支

# 4. 删除 worktree
git worktree remove ../my-project-feature
```

---

## 7. 常见问题与解决方案

### 7.1 问题：merge 冲突了怎么办？

```bash
# 1. 查看冲突文件
git status

# 2. 打开文件，看到冲突标记
<<<<<<< HEAD
你的代码
=======
别人的代码
>>>>>>> feature/other

# 3. 决策：
# - 保留你的？删除 ======= 下面的部分
# - 保留别人的？删除 <<<<<<< 上面的部分
# - 两者都要？手动合并

# 4. 删除冲突标记，保存文件

# 5. 标记为已解决
git add <file>

# 6. 继续 merge
git merge --continue
# 或如果是 rebase
git rebase --continue

# 7. 如果搞不定，放弃合并
git merge --abort
git rebase --abort
```

### 7.2 问题：不小心提交到 main 了

```bash
# 场景：你在 main 上直接改了代码并 commit

# 方案1：移动到新分支（未 push 的情况）
git branch feature/oops      # 创建新分支保存这些 commits
git reset --hard origin/main # main 回到远程状态
git checkout feature/oops    # 切换到新分支继续开发

# 方案2：已经 push 了
# 创建 revert commit
git revert HEAD
git push origin main
```

### 7.3 问题：push 被拒绝 (rejected)

```bash
# 错误信息：
# ! [rejected] main -> main (non-fast-forward)

# 原因：远程有你没有的 commits

# 解决方案1：先 pull 再 push
git pull origin main
# 如果有冲突，解决后
git push origin main

# 解决方案2：rebase 方式（更干净）
git pull --rebase origin main
git push origin main

# 解决方案3：强制推送 (⚠️ 危险！会覆盖远程)
git push -f origin main
# 只在以下情况使用：
# - 你确定远程的 commits 不需要
# - 这是你个人的分支
# - 没有其他人在用这个分支
```

### 7.4 问题：怎么撤销已经 push 的 commit？

```bash
# ❌ 错误做法：
git reset --hard HEAD~1
git push -f origin main
# 这会影响其他人！

# ✅ 正确做法：使用 revert
git revert HEAD
git push origin main

# revert 会创建一个新的 commit，撤销之前的改动
# 历史记录保留，其他人不受影响
```

### 7.5 问题：分支太乱了，想重新开始

```bash
# 方案1：基于远程 main 重新创建分支
git fetch origin
git checkout -b feature/new-clean-branch origin/main

# 方案2：cherry-pick 有用的 commits
git checkout -b feature/clean origin/main
git cherry-pick <commit1> <commit2> <commit3>

# 方案3：soft reset 保留改动
git checkout feature/messy-branch
git reset --soft origin/main  # 所有改动回到暂存区
git reset HEAD                # 移到工作区
git add -p                    # 选择性添加
git commit                    # 重新组织成干净的 commits
```

### 7.6 问题：错误地删除了分支

```bash
# 1. 找到分支的最后一个 commit
git reflog | grep <branch-name>

# 2. 重新创建分支
git branch <branch-name> <commit-hash>
```

---

## 8. 最佳实践 Checklist

### 8.1 每次开发前

```bash
☐ 1. 确保在正确的分支上
     git branch --show-current

☐ 2. 更新 main 分支
     git checkout main
     git pull origin main

☐ 3. 基于最新 main 创建分支
     git checkout -b feature/my-feature

☐ 4. 推送分支并设置跟踪
     git push -u origin feature/my-feature
```

### 8.2 开发过程中

```bash
☐ 1. 经常提交，每个 commit 做一件事
     git add <specific-files>
     git commit -m "feat: clear message"

☐ 2. 使用有意义的 commit message
     格式：<type>: <description>
     类型：feat/fix/docs/refactor/test/chore

☐ 3. 定期推送到远程（至少每天一次）
     git push origin feature/my-feature

☐ 4. 定期从 main 同步更新
     git checkout main
     git pull origin main
     git checkout feature/my-feature
     git merge main
```

### 8.3 提交前

```bash
☐ 1. 查看改动
     git status
     git diff

☐ 2. 运行测试和 lint
     pnpm lint
     pnpm test
     pnpm build

☐ 3. 确认只提交相关文件
     git add <specific-files>
     不要用 git add . 盲目添加所有文件

☐ 4. 写清晰的 commit message
     git commit -m "feat: add user authentication

     - Implement JWT token generation
     - Add login and register endpoints
     - Set up password hashing with bcrypt"
```

### 8.4 创建 PR 前

```bash
☐ 1. 确保分支是最新的
     git checkout main
     git pull origin main
     git checkout feature/my-feature
     git merge main

☐ 2. 解决所有冲突

☐ 3. 所有测试通过
     pnpm test

☐ 4. 代码已经 format
     pnpm format

☐ 5. 推送到远程
     git push origin feature/my-feature

☐ 6. 在 GitHub 创建 PR
     - 写清楚做了什么
     - 为什么要做
     - 怎么测试
```

### 8.5 合并后

```bash
☐ 1. 更新本地 main
     git checkout main
     git pull origin main

☐ 2. 删除本地分支
     git branch -d feature/my-feature

☐ 3. 删除远程分支（如果 GitHub 没自动删除）
     git push origin --delete feature/my-feature

☐ 4. 清理远程跟踪分支
     git remote prune origin
```

---

## 9. Git 速查命令表

### 9.1 初始化与配置

```bash
# 初始化仓库
git init

# 克隆仓库
git clone <url>

# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 查看配置
git config --list
```

### 9.2 基本操作

```bash
# 查看状态
git status
git status -s            # 简短输出

# 查看改动
git diff                 # 工作区 vs 暂存区
git diff --staged        # 暂存区 vs 仓库
git diff HEAD            # 工作区 vs 仓库

# 添加文件
git add <file>
git add .
git add -p               # 交互式添加

# 提交
git commit -m "message"
git commit --amend       # 修改上次 commit

# 查看历史
git log
git log --oneline
git log --graph
git log --all --graph --oneline

# 推送
git push
git push origin <branch>
git push -u origin <branch>   # 设置上游
git push -f                   # 强制推送（危险）

# 拉取
git pull
git pull --rebase
git fetch
```

### 9.3 分支操作

```bash
# 查看分支
git branch                # 本地
git branch -r             # 远程
git branch -a             # 所有
git branch -vv            # 详细信息

# 创建分支
git branch <name>
git checkout -b <name>
git switch -c <name>

# 切换分支
git checkout <name>
git switch <name>

# 合并分支
git merge <branch>
git merge --no-ff <branch>
git rebase <branch>

# 删除分支
git branch -d <name>
git branch -D <name>
git push origin --delete <name>
```

### 9.4 撤销操作

```bash
# 撤销工作区改动
git restore <file>
git checkout -- <file>

# 撤销暂存
git restore --staged <file>
git reset HEAD <file>

# 撤销 commit
git reset --soft HEAD~1
git reset HEAD~1
git reset --hard HEAD~1

# 创建反向 commit
git revert <commit>

# 暂存改动
git stash
git stash pop
git stash list
```

### 9.5 远程仓库

```bash
# 查看远程
git remote -v

# 添加远程
git remote add origin <url>

# 修改远程
git remote set-url origin <new-url>

# 删除远程
git remote remove origin

# 同步远程分支列表
git remote prune origin
```

---

## 10. Commit Message 规范

### 10.1 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 10.2 Type (必需)

```
feat:     新功能
fix:      修复 bug
docs:     文档修改
style:    格式修改（不影响代码运行）
refactor: 重构（既不是新功能也不是 bug 修复）
perf:     性能优化
test:     添加测试
chore:    构建过程或辅助工具的变动
revert:   撤销之前的 commit
```

### 10.3 示例

```bash
# 简单示例
git commit -m "feat: add user login feature"

# 完整示例
git commit -m "feat(auth): add JWT authentication

- Implement token generation and validation
- Add middleware for protected routes
- Set up refresh token mechanism

Closes #123"

# Bug 修复
git commit -m "fix(api): handle null response from database

When user data is not found, the API was crashing.
Now returns 404 with appropriate error message.

Fixes #456"
```

---

## 11. 实用 Git Aliases（别名）

在 `~/.gitconfig` 添加：

```bash
[alias]
    # 常用操作简写
    st = status
    co = checkout
    br = branch
    ci = commit
    cm = commit -m
    ca = commit --amend

    # 查看历史
    lg = log --graph --oneline --all
    hist = log --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short

    # 撤销操作
    undo = reset --soft HEAD^
    unstage = reset HEAD --

    # 分支管理
    branches = branch -a
    remotes = remote -v

    # 差异查看
    df = diff
    dc = diff --cached

    # 快速 stash
    save = stash save
    pop = stash pop

    # 清理
    cleanup = !git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d
```

使用：
```bash
git st           # 代替 git status
git lg           # 漂亮的 log 输出
git cleanup      # 删除已合并的分支
```

---

## 12. 总结：Git 思维导图

```
Git
├── 概念
│   ├── 三个区域（工作区/暂存区/仓库）
│   ├── 分支是指针
│   └── Commit 是快照
│
├── 基本操作
│   ├── add → commit → push
│   ├── fetch / pull
│   └── merge / rebase
│
├── 分支管理
│   ├── 创建/切换/删除
│   ├── 本地分支 vs 远程分支
│   └── 合并策略
│
├── 撤销操作
│   ├── restore（撤销工作区）
│   ├── reset（撤销 commit）
│   └── revert（创建反向 commit）
│
├── 高级技巧
│   ├── stash（暂存）
│   ├── cherry-pick（挑选）
│   ├── rebase -i（重写历史）
│   └── reflog（找回丢失的 commit）
│
└── 协作流程
    ├── Fork / Clone
    ├── Feature Branch
    ├── Pull Request
    └── Code Review
```

---

## 13. 学习路径建议

### 第1周：基础操作
- ✅ 理解三个区域概念
- ✅ 熟练使用 add, commit, push, pull
- ✅ 学会查看 status, diff, log
- ✅ 在 Cursor 中进行可视化操作

### 第2周：分支管理
- ✅ 创建和切换分支
- ✅ 合并分支（merge）
- ✅ 解决冲突
- ✅ 理解本地分支和远程分支的关系

### 第3周：撤销操作
- ✅ 撤销工作区改动（restore）
- ✅ 撤销 commit（reset）
- ✅ 使用 stash 暂存工作
- ✅ 使用 revert 撤销已推送的 commit

### 第4周：协作流程
- ✅ 完整的 Pull Request 流程
- ✅ Code Review
- ✅ 从 main 同步更新
- ✅ 保持提交历史清晰

---

## 附录：快捷键速查

### Cursor/VS Code Git 快捷键

```
Cmd+Shift+G        打开 Source Control 面板
Cmd+Enter          提交暂存的改动
Cmd+K Cmd+U        撤销暂存
Cmd+K Cmd+D        查看下一个改动
Cmd+K Cmd+Shift+D  查看上一个改动
Cmd+Shift+P        打开命令面板（输入 git 查看所有 git 命令）
```

---

**🎉 恭喜！你现在已经掌握了 Git 的核心知识！**

**下一步建议：**
1. 实际操作一遍每个场景
2. 在项目中应用这些最佳实践
3. 遇到问题时查阅对应章节
4. 逐步学习高级技巧

**记住：Git 熟练需要实践，多用就会了！** 💪
