# 移动端测试指南

本指南提供 LearnMore 平台移动端功能的完整测试流程。

## 📱 测试环境要求

### 最低支持版本

#### iOS
- **iOS 15.0+**
- Safari 15+
- 测试设备: iPhone SE (2nd gen), iPhone 12 Mini, iPhone 14 Pro

#### Android
- **Android 10+**
- Chrome 90+
- 测试设备: Pixel 4, Samsung Galaxy S21, OnePlus 9

#### 微信浏览器
- 微信版本 8.0+
- 基于 Chrome WebView

---

## 🧪 测试清单

### Phase 1: 响应式布局测试

#### 1.1 底部导航栏 (BottomTabBar)
- [ ] 显示5个Tab: 首页、课程、练习、社区、我的
- [ ] 当前页面Tab高亮显示
- [ ] 点击切换页面正常
- [ ] 安全区域适配 (iPhone X系列刘海屏)
- [ ] 横屏时正常显示

**测试步骤:**
```bash
1. 打开应用首页
2. 检查底部导航栏是否显示
3. 逐一点击每个Tab,确认页面跳转
4. 在iPhone X系列设备上检查是否有安全区域间距
```

#### 1.2 移动端头部 (MobileHeader)
- [ ] 显示Logo和品牌名称
- [ ] 桌面端隐藏,移动端显示
- [ ] 高度56px,背景模糊效果
- [ ] 滚动时保持固定

#### 1.3 触摸目标尺寸
- [ ] 所有可点击元素最小 44x44px
- [ ] 表单输入框最小高度 44px
- [ ] 按钮易于点击,无误触

**验证方法:**
```javascript
// 在浏览器控制台运行
document.querySelectorAll('button, a, [role="button"]').forEach(el => {
  const rect = el.getBoundingClientRect()
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Touch target too small:', el, rect)
  }
})
```

---

### Phase 2: 触摸手势测试

#### 2.1 课程章节滑动 (LessonSwipeView)
- [ ] 左滑切换到下一章
- [ ] 右滑切换到上一章
- [ ] 第一章禁止右滑
- [ ] 最后一章禁止左滑
- [ ] 滑动距离 >50px 或速度 >0.3 触发切换
- [ ] 平滑动画过渡

**测试步骤:**
```bash
1. 进入任意课程章节
2. 左滑 → 应切换到下一章
3. 右滑 → 应切换到上一章
4. 在第一章右滑 → 无反应
5. 在最后一章左滑 → 无反应
```

#### 2.2 下拉刷新 (PullToRefresh)
- [ ] 在页面顶部下拉显示刷新指示器
- [ ] 下拉距离 >80px 触发刷新
- [ ] 显示"下拉刷新"/"松开刷新"/"刷新中"状态
- [ ] 刷新完成后自动回弹
- [ ] 阻尼效果(拉得越远,阻力越大)

**测试步骤:**
```bash
1. 滚动到页面顶部
2. 向下拖动页面
3. 观察刷新指示器动画
4. 拉到阈值(80px)后松手
5. 确认刷新动作执行
```

#### 2.3 长按菜单 (LongPressMenu)
- [ ] 长按500ms触发菜单
- [ ] 触发时有触觉反馈(振动)
- [ ] 显示收藏、分享、举报选项
- [ ] 点击菜单项执行对应操作
- [ ] 桌面端右键也能触发

**测试步骤:**
```bash
1. 找到支持长按的元素(如帖子卡片)
2. 长按0.5秒
3. 检查是否振动(仅支持振动的设备)
4. 确认菜单弹出
5. 点击菜单项测试功能
```

#### 2.4 图片/公式缩放 (PinchZoomImage)
- [ ] 双指捏合缩放 (1x~4x)
- [ ] 双击切换缩放
- [ ] 缩放后可拖拽平移
- [ ] 显示缩放控制按钮(+, -, 重置)
- [ ] 数学公式正确渲染

**测试步骤:**
```bash
1. 打开 /demo/zoom 演示页面
2. 双指捏合图片 → 应缩放
3. 双击图片 → 应在1x和2x之间切换
4. 缩放后拖拽 → 应平移
5. 点击控制按钮测试功能
```

---

### Phase 3: PWA功能测试

#### 3.1 应用安装
- [ ] Android: 显示"安装到主屏幕"提示
- [ ] iOS: 显示"添加到主屏幕"指南
- [ ] 安装后显示应用图标
- [ ] 从主屏幕启动进入独立模式

**测试步骤 (Android):**
```bash
1. 打开Chrome浏览器访问应用
2. 等待3秒后应出现安装提示
3. 点击"立即安装"
4. 检查主屏幕是否添加图标
5. 点击图标启动应用(无浏览器地址栏)
```

**测试步骤 (iOS):**
```bash
1. 打开Safari访问应用
2. 等待5秒后应出现安装指南
3. 点击分享按钮 → 添加到主屏幕
4. 检查主屏幕图标
5. 启动应用
```

#### 3.2 离线功能
- [ ] 首次访问后缓存关键资源
- [ ] 断网后仍可访问已缓存页面
- [ ] 显示离线页面 (/offline.html)
- [ ] 网络恢复后自动重连

**测试步骤:**
```bash
1. 正常访问应用几个页面
2. 打开开发者工具 → Network → Offline
3. 刷新页面或访问已缓存页面
4. 确认页面正常显示
5. 尝试访问未缓存页面 → 应显示离线页面
6. 恢复网络 → 应显示"网络已连接"提示
```

#### 3.3 Service Worker更新
- [ ] 发现新版本时显示更新提示
- [ ] 点击"刷新"按钮更新应用
- [ ] 更新后显示最新内容

---

### Phase 4: 性能测试

#### 4.1 加载性能
- [ ] FCP (首次内容绘制) < 1s
- [ ] LCP (最大内容绘制) < 2.5s
- [ ] TTI (可交互时间) < 3s
- [ ] CLS (累积布局偏移) < 0.1

**使用 Lighthouse 测试:**
```bash
1. 打开Chrome DevTools
2. 切换到Lighthouse标签
3. 选择"移动端" + "性能"
4. 点击"生成报告"
5. 检查各项指标
```

#### 4.2 图片加载
- [ ] 图片懒加载(滚动到视口才加载)
- [ ] 自动选择WebP/AVIF格式
- [ ] 显示加载占位符
- [ ] 加载失败显示错误图标

**测试步骤:**
```bash
1. 打开有大量图片的页面
2. 打开Network面板,清空记录
3. 向下滚动
4. 观察图片是否在接近视口时才加载
5. 检查图片格式(应为webp/avif)
```

#### 4.3 虚拟列表
- [ ] 长列表(>100项)滚动流畅 60fps
- [ ] 只渲染可见区域的元素
- [ ] 快速滚动无卡顿
- [ ] DOM节点数量合理(<50)

**测试步骤:**
```bash
1. 打开排行榜或长列表页面
2. 打开Performance面板开始录制
3. 快速滚动列表
4. 停止录制,检查帧率
5. 打开Elements面板,检查DOM节点数
```

---

### Phase 5: 兼容性测试

#### 5.1 浏览器兼容性
- [ ] Chrome 90+ (Android)
- [ ] Safari 15+ (iOS)
- [ ] Firefox 88+ (Android)
- [ ] Edge 90+ (Windows Mobile)
- [ ] 微信浏览器 8.0+

**测试矩阵:**

| 浏览器 | 版本 | 响应式 | 手势 | PWA | 性能 |
|--------|------|--------|------|-----|------|
| Chrome 90 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Safari 15 | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Firefox 88 | ✅ | ✅ | ✅ | ✅ | ✅ |
| WeChat 8.0 | ✅ | ✅ | ⚠️ | ❌ | ✅ |

#### 5.2 设备兼容性
- [ ] iPhone SE (320px宽度)
- [ ] iPhone 12 Mini (375px)
- [ ] iPhone 14 Pro (390px)
- [ ] iPhone 14 Pro Max (428px)
- [ ] iPad Mini (768px)
- [ ] Samsung Galaxy S21 (360px)
- [ ] Pixel 4 (411px)

#### 5.3 特殊场景
- [ ] 横屏模式正常显示
- [ ] 暗黑模式正常显示
- [ ] 弱网环境(3G)可用
- [ ] 无网环境部分可用
- [ ] 辅助功能(屏幕阅读器)支持

---

## 🛠️ 测试工具

### 1. Chrome DevTools

#### Device Mode (设备模拟)
```bash
1. F12 打开DevTools
2. Ctrl+Shift+M 切换设备模式
3. 选择设备: iPhone 14 Pro, Pixel 5等
4. 测试响应式布局
```

#### Network (网络调试)
```bash
1. 选择网络速度: Fast 3G, Slow 3G, Offline
2. 测试弱网和离线场景
3. 查看资源加载情况
```

#### Lighthouse (性能审计)
```bash
1. 打开Lighthouse标签
2. 选择"移动端"
3. 勾选"性能"、"PWA"、"可访问性"
4. 生成报告
```

### 2. 真机调试

#### iOS (Safari)
```bash
1. iPhone连接Mac
2. iPhone: 设置 → Safari → 高级 → 网页检查器(开启)
3. Mac Safari: 开发 → [设备名称] → [页面]
4. 开始调试
```

#### Android (Chrome)
```bash
1. Android设备: 开发者选项 → USB调试(开启)
2. 连接电脑
3. Chrome访问: chrome://inspect
4. 点击设备下的"Inspect"
5. 开始调试
```

### 3. 在线测试工具

- **BrowserStack**: https://www.browserstack.com
  - 云端真机测试
  - 支持iOS和Android

- **LambdaTest**: https://www.lambdatest.com
  - 跨浏览器测试
  - 截图对比

- **WebPageTest**: https://www.webpagetest.org
  - 性能测试
  - 生成瀑布图

---

## 📊 测试报告模板

```markdown
# 移动端测试报告

**测试日期:** YYYY-MM-DD
**测试人员:** [姓名]
**应用版本:** v1.0.0

## 测试环境
- 设备: iPhone 14 Pro (iOS 16.5)
- 浏览器: Safari 16.5
- 网络: WiFi

## 测试结果

### Phase 1: 响应式布局 ✅
- 底部导航栏: ✅ 通过
- 移动端头部: ✅ 通过
- 触摸目标尺寸: ✅ 通过

### Phase 2: 触摸手势 ✅
- 章节滑动: ✅ 通过
- 下拉刷新: ✅ 通过
- 长按菜单: ⚠️ 问题(见下方)
- 图片缩放: ✅ 通过

### Phase 3: PWA功能 ⚠️
- 应用安装: ⚠️ iOS需手动添加
- 离线功能: ✅ 通过
- Service Worker: ✅ 通过

### Phase 4: 性能 ✅
- Lighthouse分数: 92/100
- FCP: 0.8s ✅
- LCP: 2.1s ✅
- TTI: 2.8s ✅

### Phase 5: 兼容性 ✅
- 浏览器兼容: ✅ 通过
- 设备兼容: ✅ 通过
- 特殊场景: ✅ 通过

## 发现的问题

### 问题1: 长按菜单振动不生效
**严重程度:** 低
**重现步骤:**
1. 在iOS设备上长按帖子卡片
2. 菜单弹出但无振动反馈

**原因:** iOS Safari不支持Vibration API
**解决方案:** 已添加降级处理,功能正常

## 建议
1. 考虑添加手势教程引导
2. 优化弱网环境下的加载速度
3. 增加骨架屏提升感知性能

## 总体评价
✅ 通过测试,建议发布
```

---

## 🚀 自动化测试

### Playwright 移动端测试脚本

```javascript
// tests/mobile.spec.ts
import { test, expect, devices } from '@playwright/test'

test.use({ ...devices['iPhone 14 Pro'] })

test.describe('移动端测试', () => {
  test('底部导航栏显示正常', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="bottom-tab-bar"]')).toBeVisible()
  })

  test('课程章节滑动切换', async ({ page }) => {
    await page.goto('/course/math/lesson-1')

    // 左滑
    await page.locator('.lesson-content').swipe({ direction: 'left' })
    await expect(page).toHaveURL(/lesson-2/)

    // 右滑
    await page.locator('.lesson-content').swipe({ direction: 'right' })
    await expect(page).toHaveURL(/lesson-1/)
  })

  test('下拉刷新', async ({ page }) => {
    await page.goto('/dashboard')

    // 模拟下拉
    await page.locator('body').swipe({ direction: 'down', distance: 100 })

    // 等待刷新完成
    await expect(page.locator('.refresh-indicator')).toBeVisible()
    await page.waitForLoadState('networkidle')
  })
})
```

---

## 📝 注意事项

1. **iOS Safari特殊性**
   - 不支持PWA安装提示(需手动添加)
   - Vibration API不支持
   - 100vh高度问题(已修复)

2. **微信浏览器限制**
   - Service Worker可能被禁用
   - 某些API受限
   - 需单独测试

3. **性能测试建议**
   - 使用真机测试,模拟器结果不准确
   - 测试弱网环境(Fast 3G)
   - 检查内存占用

4. **安全性**
   - 测试HTTPS连接
   - 检查跨域请求
   - 验证输入过滤

---

## ✅ 发布前检查清单

- [ ] 所有Phase测试通过
- [ ] Lighthouse分数 >90
- [ ] 真机测试(iOS + Android各1台)
- [ ] 弱网测试通过
- [ ] 离线功能正常
- [ ] 无控制台错误
- [ ] 图标和截图正确
- [ ] manifest.json配置完整
- [ ] Service Worker正常工作
- [ ] 兼容性矩阵填写完整

**完成以上所有项目后方可发布生产环境。**
