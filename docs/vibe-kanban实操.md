# Vibe Kanban + Git Worktree 实操指南

## 📌 核心概念

Vibe Kanban 是一个 AI 编程代理编排平台，通过 Git Worktree 实现任务隔离，让你能够：
- 并行运行多个 AI 编程任务
- 每个任务在独立的 Git worktree 中执行
- 避免分支冲突和代码污染
- 一键合并和清理

---

## 🎯 关键理解

### Git Worktree 工作原理

```
主工作目录 (main分支)
/Users/victorsim/Desktop/Projects/learn_more_v1.0

Worktree目录 (任务分支)
/private/var/folders/.../vibe-kanban/worktrees/8492-story043-b1/learn_more_v1.0
```

**核心规则**：
- 一个分支只能在一个 worktree 中 checkout
- main 分支永远在主目录
- 任务分支在临时 worktree 中
- **不能在 worktree 中切换到 main 分支**（会报错：`'main' is already checked out`）

---

## ✅ 正确工作流程

### Step 1: 初始化环境

#### 1.1 添加 Cursor 到 PATH（一次性配置）

```bash
# 编辑 ~/.zshrc
echo '# Add Cursor to PATH for Vibe Kanban integration
export PATH="$PATH:/Applications/Cursor.app/Contents/Resources/app/bin"' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 验证
which cursor
# 输出: /Applications/Cursor.app/Contents/Resources/app/bin/cursor
```

#### 1.2 配置 Vibe Kanban Settings

进入 Vibe Kanban Settings → Editor：
- **Editor Type**: Cursor
- **Remote SSH Host**: 留空（本地开发）
- 确保没有 "Not found in PATH" 警告

---

### Step 2: 创建任务并开始工作

#### 2.1 在 Vibe Kanban 中创建 Task

- 点击 "New Task" 或 "Run Task"
- Vibe Kanban 自动创建 worktree 和分支（例如：`vk/8492-story043-b1`）

#### 2.2 打开 Worktree 目录

**方法A：使用 Vibe Kanban（推荐）**
- 点击 Task 卡片上的 **"Open in Cursor"** 按钮
- Vibe Kanban 自动打开正确的 worktree 目录

**方法B：手动打开**
```bash
# 1. 查找 worktree 路径
git worktree list

# 2. 手动打开 Cursor
cursor /path/to/worktree/directory
```

#### 2.3 验证你在正确的目录

检查 Cursor 底部状态栏：
- ✅ 分支名：`vk/8492-story043-b1`（不是 main）
- ✅ 路径包含：`.../vibe-kanban/worktrees/...`

---

### Step 3: 开发和测试

在 worktree 目录中的 Cursor 窗口工作：

```bash
# 运行质量检查
pnpm lint && pnpm tsc --noEmit && pnpm build

# 查看修改
git status
git diff

# 提交更改（在 worktree 中）
git add .
git commit -m "feat: Story043-B1完成"
git push origin vk/8492-story043-b1
```

---

### Step 4: 合并到 Main

#### 方式A：使用 Vibe Kanban UI（推荐⭐）

1. 在 Vibe Kanban 中点击 Task 的 **"Merge"** 按钮
2. Vibe Kanban 自动执行：
   - Rebase 到 main
   - 合并代码
   - 清理 worktree
   - 删除远程分支

#### 方式B：手动合并

```bash
# 1. 回到主目录
cd /Users/victorsim/Desktop/Projects/learn_more_v1.0

# 2. 确保 main 分支是最新的
git checkout main
git pull origin main

# 3. 合并任务分支
git merge vk/8492-story043-b1
git push origin main

# 4. 清理 worktree
git worktree remove /path/to/worktree
git branch -d vk/8492-story043-b1

# 5. 删除远程分支（可选）
git push origin --delete vk/8492-story043-b1
```

---

## 🚨 常见问题与解决

### 问题1：Cursor 看不到 worktree 中的 changes

**原因**：Cursor 打开的是主目录，而不是 worktree 目录

**解决**：
1. 关闭当前 Cursor 窗口
2. 使用 Vibe Kanban 的 "Open in Cursor" 按钮重新打开
3. 或手动打开 worktree 路径：
   ```bash
   git worktree list  # 查找路径
   cursor /path/to/worktree
   ```

---

### 问题2：无法切换到 main 分支

**错误信息**：
```
Git: fatal: 'main' is already checked out at '/Users/victorsim/Desktop/Projects/learn_more_v1.0'
```

**原因**：Git worktree 的保护机制，main 已经在主目录 checkout

**解决**：
- ❌ **不要**在 worktree 中切换到 main
- ✅ **正确做法**：关闭 Cursor，在主目录重新打开

```bash
# 回到主目录
cd /Users/victorsim/Desktop/Projects/learn_more_v1.0

# 打开主目录的 Cursor
cursor .
```

---

### 问题3：Vibe Kanban "Open in Cursor" 无反应

**错误**：Settings → Editor 显示 "Not found in PATH"

**解决**：按照 Step 1.1 添加 Cursor 到 PATH，然后重启 Vibe Kanban

---

### 问题4：修改保存在了错误的分支

**场景**：在 main 分支修改了文件，但应该在 worktree 中

**解决**：
```bash
# 在主目录中
git stash  # 暂存修改

# 切换到 worktree
cd /path/to/worktree

# 应用修改
git stash pop

# 提交到正确的分支
git add .
git commit -m "fix: 移动到正确的分支"
```

---

## 📊 最佳实践

### ✅ 正确做法

1. **隔离原则**：每个 task 都在独立 worktree 中工作
2. **使用工具**：始终用 Vibe Kanban 的 "Open in Cursor" 按钮
3. **验证环境**：开始工作前检查 Cursor 状态栏的分支名
4. **一键合并**：使用 Vibe Kanban UI 完成 merge/cleanup
5. **保持整洁**：完成后立即清理 worktree

### ❌ 避免的错误

1. ❌ 在主目录窗口中开发任务代码
2. ❌ 在 Cursor 左下角手动切换分支
3. ❌ 在 worktree 中尝试 checkout main
4. ❌ 混用多个 Cursor 项目窗口
5. ❌ 手动管理 worktree（让 Vibe Kanban 自动处理）

---

## 🎯 完整工作流程示例

### 场景：完成 Story-043.B1 任务

```bash
# 1. 在 Vibe Kanban 创建 Task
# 自动创建分支: vk/8492-story043-b1

# 2. 点击 "Open in Cursor"
# Cursor 自动打开 worktree 目录

# 3. 验证环境
# Cursor 状态栏显示: vk/8492-story043-b1 ✅

# 4. 开发功能
# 编写代码、测试、修改...

# 5. 提交代码
git add .
git commit -m "feat: implement Story043.B1 - 智能推题逻辑"
git push origin vk/8492-story043-b1

# 6. 在 Vibe Kanban 点击 "Merge"
# 自动 rebase、merge、cleanup ✅

# 7. 验证合并
cd /Users/victorsim/Desktop/Projects/learn_more_v1.0
git log --oneline -3  # 查看最新提交
```

---

## 🔧 实用命令速查

### 查看所有 worktree

```bash
git worktree list
```

### 手动清理 worktree

```bash
# 删除 worktree
git worktree remove /path/to/worktree

# 删除对应分支
git branch -d vk/8492-story043-b1

# 删除远程分支
git push origin --delete vk/8492-story043-b1
```

### 检查当前所在位置

```bash
pwd                    # 当前目录路径
git branch --show-current  # 当前分支
git status             # Git 状态
```

---

## 📚 参考资源

- [Vibe Kanban 官方文档](https://www.vibekanban.com/docs)
- [Git Worktree 官方文档](https://git-scm.com/docs/git-worktree)
- [GitHub - BloopAI/vibe-kanban](https://github.com/BloopAI/vibe-kanban)

---

## 🎓 经验总结

### 核心认知

1. **Worktree 不是分支切换**：它是完整的工作目录副本
2. **Cursor 窗口 = 一个工作目录**：不要期望在同一窗口切换 worktree
3. **Vibe Kanban 是编排工具**：让它管理 worktree 生命周期
4. **隔离是前提**：每个 AI 任务都应该在独立环境中

### 效率提升

- 并行开发：可以同时运行 3-5 个独立任务
- 零冲突：每个任务在独立分支，互不干扰
- 快速切换：不需要 stash/commit 就能切换任务
- 安全回滚：任务失败只需删除 worktree，不影响 main

---

**✨ 记住**：你不再是"程序员写代码"，而是"AI 代理管理员" —— 定义任务、分配工作、审查输出、批准合并。

Vibe Kanban + Git Worktree = **AI 编程的最佳实践** 🚀
