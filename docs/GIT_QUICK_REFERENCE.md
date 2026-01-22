# Git 快速参考卡 🚀

> 5 分钟速查表 - 最常用的 Git 操作

---

## 🎯 日常必备 Top 10

```bash
# 1. 查看状态
git status

# 2. 查看改动
git diff

# 3. 添加文件到暂存区
git add <file>           # 特定文件
git add .                # 所有文件

# 4. 提交
git commit -m "feat: message"

# 5. 推送到远程
git push origin <branch>

# 6. 拉取远程更新
git pull origin <branch>

# 7. 创建并切换分支
git checkout -b <branch-name>

# 8. 切换分支
git checkout <branch-name>

# 9. 查看分支
git branch -a

# 10. 查看提交历史
git log --oneline --graph
```

---

## 🔄 工作流速查

### 新功能开发

```bash
# 1. 更新 main
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/my-feature

# 3. 开发... (写代码)

# 4. 提交
git add .
git commit -m "feat: implement feature"

# 5. 推送
git push -u origin feature/my-feature

# 6. 在 GitHub 创建 PR
```

### 同步远程更新

```bash
# 方式1: Pull (推荐)
git checkout main
git pull origin main
git checkout feature/my-branch
git merge main

# 方式2: Fetch + Merge
git fetch origin
git merge origin/main

# 方式3: Rebase (高级)
git pull --rebase origin main
```

---

## ⚡ 撤销操作速查

| 场景 | 命令 | 说明 |
|------|------|------|
| 撤销工作区改动 | `git restore <file>` | 丢弃未 add 的改动 |
| 撤销暂存 | `git restore --staged <file>` | 已 add 但想取消 |
| 撤销最后一次 commit | `git reset --soft HEAD~1` | 保留改动，可重新 commit |
| 撤销 commit 但保留改动 | `git reset HEAD~1` | 改动回到工作区 |
| 完全撤销（危险） | `git reset --hard HEAD~1` | 所有改动丢失！ |
| 撤销已推送的 commit | `git revert <commit>` | 创建反向 commit |

---

## 🌳 分支操作速查

```bash
# 查看
git branch              # 本地分支
git branch -r           # 远程分支
git branch -a           # 所有分支

# 创建
git branch <name>       # 只创建
git checkout -b <name>  # 创建并切换

# 切换
git checkout <name>
git switch <name>       # 新语法

# 删除
git branch -d <name>    # 安全删除
git branch -D <name>    # 强制删除
git push origin --delete <name>  # 删除远程

# 重命名
git branch -m old new
```

---

## 🔍 查看历史

```bash
# 基础查看
git log
git log --oneline
git log --graph --all

# 查看特定文件历史
git log -- <file>

# 查看某个 commit
git show <commit-hash>

# 查看改动统计
git log --stat

# 查看最近 5 个 commit
git log -5

# 美化输出
git log --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short
```

---

## 💾 Stash 速查

```bash
# 暂存改动
git stash
git stash save "message"

# 查看列表
git stash list

# 恢复
git stash pop           # 恢复并删除
git stash apply         # 恢复但保留

# 删除
git stash drop stash@{0}
git stash clear         # 删除所有
```

---

## 🔗 远程仓库

```bash
# 查看远程
git remote -v

# 添加远程
git remote add origin <url>

# 修改远程地址
git remote set-url origin <new-url>

# 拉取远程分支
git fetch origin
git pull origin <branch>

# 推送
git push origin <branch>
git push -u origin <branch>  # 首次推送并设置跟踪
```

---

## 🆘 紧急救援

### 问题1: 不小心改错了，还没 commit

```bash
git restore <file>      # 撤销单个文件
git restore .           # 撤销所有文件
```

### 问题2: commit 消息写错了

```bash
git commit --amend -m "正确的消息"
```

### 问题3: commit 到错误的分支了

```bash
# 假设在 main 上误操作
git branch feature/temp    # 保存到新分支
git reset --hard HEAD~1    # main 回退
git checkout feature/temp  # 切换到新分支继续
```

### 问题4: 想合并某个特定的 commit

```bash
git cherry-pick <commit-hash>
```

### 问题5: merge 冲突了

```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑解决冲突

# 3. 标记为已解决
git add <resolved-file>

# 4. 继续 merge
git commit

# 5. 放弃 merge
git merge --abort
```

### 问题6: push 被拒绝

```bash
# 先 pull 再 push
git pull origin <branch>
git push origin <branch>
```

---

## 📋 Cursor 快捷键

```
Cmd+Shift+G         打开 Source Control
Cmd+Enter           Commit
Cmd+K Cmd+U         Unstage
F7                  下一个改动
Shift+F7            上一个改动
Cmd+Shift+L         切换 GitLens Blame
```

---

## 🎨 Commit Message 规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档修改
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具变动

**示例：**
```bash
git commit -m "feat(auth): add JWT authentication

- Implement token generation
- Add middleware for protected routes
- Set up refresh token mechanism

Closes #123"
```

---

## 🚨 安全检查清单

### 提交前检查

```bash
☐ git status              # 确认提交内容
☐ git diff                # 检查具体改动
☐ pnpm lint              # 代码检查
☐ pnpm test              # 运行测试
☐ pnpm build             # 确保能编译
```

### 推送前检查

```bash
☐ git log --oneline -3   # 检查 commit 历史
☐ commit message 清晰
☐ 没有敏感信息（密码、密钥）
☐ 已在本地测试通过
```

---

## 💡 最佳实践

1. **经常提交**
   - 每完成一个小功能就提交
   - 不要累积大量改动

2. **写清晰的 commit message**
   - 说明做了什么
   - 说明为什么做

3. **保持分支整洁**
   - 一个分支做一件事
   - 合并后删除分支

4. **定期同步**
   - 每天至少 pull 一次
   - 避免冲突累积

5. **不要 force push 公共分支**
   - main/master 绝对不能 force push
   - 会影响其他人的工作

---

## 🔗 扩展阅读

详细文档：
- `docs/GIT_MASTERY_GUIDE.md` - 完整 Git 指南
- `docs/CURSOR_GIT_VISUAL_GUIDE.md` - Cursor 可视化操作

在线资源：
- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 指南](https://guides.github.com/)
- [Git 可视化学习](https://learngitbranching.js.org/)

---

**💾 建议：打印这页或设为书签，随时查阅！**
