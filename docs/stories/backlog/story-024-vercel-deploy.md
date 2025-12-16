# Story-024: Vercel部署与预览链接

**状态**: Backlog ⚪
**优先级**: P0 (Critical)
**预计工时**: 2-3小时
**前置依赖**: Story-021, Story-022, Story-023
**阻塞Story**: Story-025

---

## 1. 目标 (Objectives)

- [ ] 配置Vercel项目
- [ ] 部署到Vercel预览环境
- [ ] 获取可分享的预览链接
- [ ] 验证所有页面在生产环境正常工作

---

## 2. 技术方案 (Tech Plan)

### Step 1: 安装Vercel CLI

```bash
pnpm add -g vercel
```

### Step 2: 登录Vercel

```bash
vercel login
```

### Step 3: 部署到预览环境

```bash
# 首次部署
vercel

# 后续部署
vercel --prod
```

### Step 4: 配置环境变量

在Vercel Dashboard中配置:
- `NEXT_PUBLIC_SUPABASE_URL` (使用Mock值)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (使用Mock值)

### Step 5: 验证部署

访问Vercel提供的预览链接,测试所有页面。

---

## 3. 验收标准 (Verification)

- [ ] 预览链接可以正常访问
- [ ] 所有页面路由正常工作
- [ ] 图片和静态资源加载正常
- [ ] 暗黑模式切换正常
- [ ] Mobile设备访问正常

---

## 4. 交付物 (Deliverables)

- Vercel预览链接
- 部署配置文件 `vercel.json`
- 部署成功截图

---

## 5. Definition of Done

- [x] 所有Objectives已完成
- [x] 所有Verification测试通过
- [x] 预览链接已分享给用户
- [x] 代码已commit
- [x] 文档已更新

---

**创建时间**: 2025-12-13
