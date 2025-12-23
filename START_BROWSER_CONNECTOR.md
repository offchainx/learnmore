# 🌐 启动 Browser Connector (用于 MCP Browser Tools)

## 什么是 Browser Connector?

Browser Connector 是一个桥接程序,允许 Claude Code 通过 MCP 访问你的浏览器:
- 📸 截图
- 📋 读取 Console 日志
- 🔍 检查网络请求
- 🐛 调试问题

---

## 🚀 启动步骤

### 方法 1: 使用 npx (推荐)

打开**新的终端窗口** (不要关闭 `pnpm dev`),运行:

```bash
npx @cloudflare/browser-connector
```

### 方法 2: 全局安装后启动

```bash
# 一次性安装
npm install -g @cloudflare/browser-connector

# 然后启动
browser-connector
```

---

## 📋 预期输出

启动成功后,你应该看到类似:

```
Browser Connector v1.x.x
Listening on http://localhost:3456
Waiting for browser connections...
```

---

## 🔗 连接浏览器

### 自动连接 (如果支持)
某些配置会自动连接到打开的 Chrome 标签页。

### 手动连接
1. 打开 Chrome
2. 访问 `http://localhost:3000` (你的应用)
3. Browser Connector 应该会检测到并连接

---

## ✅ 验证连接

在 Claude Code 中,我会尝试:
```
mcp__browser-tools__takeScreenshot
```

如果成功,你会看到截图!

---

## ⚠️ 常见问题

### 问题 1: 端口被占用
```
Error: listen EADDRINUSE: address already in use :::3456
```

**解决方案**:
```bash
# 找到占用端口的进程
lsof -i :3456

# 杀死进程
kill -9 <PID>

# 重新启动
npx @cloudflare/browser-connector
```

### 问题 2: Chrome 没有连接

**解决方案**:
1. 确保 Chrome 正在运行
2. 访问 `http://localhost:3000`
3. 刷新页面 (F5)
4. 检查 Browser Connector 终端是否显示连接

### 问题 3: 仍然无法连接

**备用方案**:
使用传统的截图方式,我会继续帮你调试!

---

## 🛑 停止 Browser Connector

当不需要时,在终端按 `Ctrl+C` 停止。

---

## 📝 启动后告诉我

启动 Browser Connector 后,请告诉我:
- ✅ 看到了什么输出
- ✅ 是否显示 "Listening on..." 或类似信息

然后我会立即测试连接! 🎉
