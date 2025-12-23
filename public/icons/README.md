# PWA 图标资源

此目录包含 LearnMore PWA 应用所需的各种尺寸图标。

## 需要的图标尺寸

根据 `manifest.json` 配置,需要以下尺寸的图标:

### 必需图标 (Maskable)
- `icon-72x72.png` - Android 通知图标
- `icon-96x96.png` - Android 启动器图标 (ldpi)
- `icon-128x128.png` - Android 启动器图标 (mdpi)
- `icon-144x144.png` - Android 启动器图标 (hdpi)
- `icon-152x152.png` - iOS/iPad 图标
- `icon-192x192.png` - Android 启动器图标 (xhdpi) ⭐ 最小必需
- `icon-384x384.png` - Android 启动器图标 (xxhdpi)
- `icon-512x512.png` - Android 启动器图标 (xxxhdpi) ⭐ 最大必需

### 快捷方式图标
- `shortcut-learn.png` (96x96) - 开始学习快捷方式
- `shortcut-practice.png` (96x96) - 练习题库快捷方式
- `shortcut-community.png` (96x96) - 社区讨论快捷方式

### iOS 特殊图标
- `apple-touch-icon.png` (180x180) - iOS 主屏幕图标

## 图标设计规范

### Maskable 图标要求
- 使用 **安全区域** 设计,确保重要内容在中心 80% 区域内
- 背景色: `#1e293b` (slate-800)
- 图标主色: `#667eea` (紫色渐变)
- 格式: PNG, 24-bit RGB + Alpha

### 设计建议
1. **Logo居中**: 主要Logo放在中心 80% 的安全区域内
2. **背景填充**: 使用品牌色填充整个画布
3. **对比度**: 确保Logo与背景有足够的对比度
4. **简洁明了**: 移动端图标要简洁,避免过多细节

## 生成图标工具

### 方法 1: 在线工具 (推荐)
使用 [Maskable.app](https://maskable.app/editor) 在线编辑器:
1. 上传原始Logo (建议 512x512 或更大)
2. 调整安全区域
3. 选择背景色
4. 导出所有尺寸

### 方法 2: ImageMagick CLI
```bash
# 安装 ImageMagick
brew install imagemagick

# 从 512x512 源图标生成所有尺寸
convert icon-512x512.png -resize 384x384 icon-384x384.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 72x72 icon-72x72.png

# 生成 iOS 图标
convert icon-512x512.png -resize 180x180 apple-touch-icon.png
```

### 方法 3: PWA Asset Generator
```bash
# 安装工具
npm install -g pwa-asset-generator

# 生成所有资源
pwa-asset-generator source-logo.svg ./icons \
  --icon-only \
  --background "#1e293b" \
  --padding "10%"
```

## 临时占位图标

在正式设计完成之前,可以使用占位图标:

```bash
# 创建简单的占位图标 (需要 ImageMagick)
convert -size 512x512 xc:"#1e293b" \
  -gravity center \
  -pointsize 200 \
  -fill "#667eea" \
  -annotate +0+0 "LM" \
  icon-512x512.png
```

## 验证图标

### Chrome DevTools
1. 打开 Chrome DevTools → Application → Manifest
2. 检查所有图标是否正确加载
3. 查看 "Maskable icon" 预览

### Lighthouse PWA Audit
运行 Lighthouse PWA 审计,确保图标配置正确:
```bash
lighthouse https://your-domain.com --view --preset=pwa
```

## 当前状态

⚠️ **图标文件尚未创建** - 请在部署前生成所有必需的图标文件。

最低要求:
- [ ] `icon-192x192.png` (Android)
- [ ] `icon-512x512.png` (Android)
- [ ] `apple-touch-icon.png` (iOS)

推荐完整集:
- [ ] 所有 8 个标准尺寸图标
- [ ] 3 个快捷方式图标
- [ ] iOS apple-touch-icon
