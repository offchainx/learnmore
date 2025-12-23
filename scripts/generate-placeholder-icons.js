#!/usr/bin/env node

/**
 * 生成 PWA 占位图标
 * 使用 canvas 创建简单的文字图标
 */

const fs = require('fs');
const path = require('path');

// 需要的图标尺寸
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const shortcuts = ['learn', 'practice', 'community'];

console.log('⚠️  生成占位图标 (临时方案)');
console.log('---');
console.log('这些是简单的占位图标,仅用于开发环境。');
console.log('生产环境请使用专业设计的图标。');
console.log('---\n');

// 使用 SVG 作为占位图标
const generateSVGIcon = (size, text = 'LM') => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="#1e293b"/>

  <!-- 渐变定义 -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 文字 -->
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="${size * 0.4}"
    font-weight="bold"
    fill="url(#grad)"
    text-anchor="middle"
    dominant-baseline="central"
  >${text}</text>

  <!-- 装饰圆圈 -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="none" stroke="url(#grad)" stroke-width="${size * 0.02}" opacity="0.3"/>
</svg>`;
};

const iconsDir = path.join(__dirname, '../public/icons');

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成主图标
console.log('生成主图标...');
sizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`  ✅ ${filename}`);
});

// 生成 Apple Touch Icon
console.log('\n生成 Apple Touch Icon...');
const appleTouchIcon = generateSVGIcon(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('  ✅ apple-touch-icon.svg');

// 生成快捷方式图标
console.log('\n生成快捷方式图标...');
const shortcutIcons = {
  learn: '📚',
  practice: '✏️',
  community: '💬'
};

shortcuts.forEach(name => {
  const emoji = shortcutIcons[name];
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#1e293b"/>
  <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>`;

  const filename = `shortcut-${name}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`  ✅ ${filename}`);
});

console.log('\n---');
console.log('✅ 占位图标生成完成!');
console.log('\n⚠️  注意: 需要更新 manifest.json 将 .png 改为 .svg');
console.log('或者使用 ImageMagick/在线工具生成 PNG 版本。');
console.log('\n推荐: https://maskable.app/editor');
