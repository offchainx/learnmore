# PWA 截图资源

此目录包含 PWA 应用商店展示所需的截图。

## 需要的截图

根据 `manifest.json` 配置,需要以下截图:

### 移动端截图 (form_factor: narrow)
- `mobile-1.png` - 390x844 - 首页/课程学习界面
- `mobile-2.png` - 390x844 - 课程详情界面

### 桌面端截图 (form_factor: wide)
- `desktop-1.png` - 1920x1080 - 桌面端学习仪表盘

## 截图规范

### 尺寸要求
- **移动端**: 390x844 (iPhone 14 Pro 尺寸)
- **桌面端**: 1920x1080 (Full HD)

### 内容建议
1. **真实内容**: 使用实际课程内容,避免占位文字
2. **隐私保护**: 隐藏或模糊敏感用户信息
3. **高质量**: 使用高分辨率图片,避免模糊
4. **代表性**: 展示核心功能和最佳用户体验

### 拍摄方法

#### 方法 1: Chrome DevTools
```bash
1. 打开 Chrome DevTools (F12)
2. 切换到 Device Mode (Ctrl+Shift+M)
3. 选择设备: iPhone 14 Pro (390x844)
4. 导航到目标页面
5. 右键 → Capture screenshot
```

#### 方法 2: 真机截图
```bash
1. 在真实设备上打开应用
2. 使用系统截图功能
3. 确保尺寸符合要求
```

#### 方法 3: Playwright 自动化
```javascript
// 使用 Playwright 自动截图
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  // 移动端截图 1
  await page.goto('https://your-domain.com/dashboard');
  await page.screenshot({ path: 'mobile-1.png' });

  // 移动端截图 2
  await page.goto('https://your-domain.com/course/math');
  await page.screenshot({ path: 'mobile-2.png' });

  // 桌面端截图
  await context.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('https://your-domain.com/dashboard');
  await page.screenshot({ path: 'desktop-1.png' });

  await browser.close();
})();
```

## 临时占位截图

在生产截图完成之前,可以使用占位图:

```bash
# 使用 ImageMagick 创建占位图
convert -size 390x844 xc:"#1e293b" \
  -gravity center \
  -pointsize 40 \
  -fill "#64748b" \
  -annotate +0+0 "Screenshot Coming Soon" \
  mobile-placeholder.png
```

## 优化建议

### 文件大小优化
```bash
# 使用 pngquant 压缩
pngquant --quality=65-80 --output mobile-1-optimized.png mobile-1.png

# 使用 ImageMagick
convert mobile-1.png -quality 85 -strip mobile-1-optimized.png
```

### 格式转换
PWA 推荐使用 PNG 格式,但也可以使用 WebP:

```bash
# PNG to WebP
cwebp -q 80 mobile-1.png -o mobile-1.webp
```

## 当前状态

⚠️ **截图文件尚未创建** - 请在提交到应用商店前创建实际截图。

待办:
- [ ] 拍摄移动端首页截图
- [ ] 拍摄移动端课程详情截图
- [ ] 拍摄桌面端仪表盘截图
- [ ] 优化文件大小 (<500KB per image)
- [ ] 验证截图在不同设备上的展示效果
