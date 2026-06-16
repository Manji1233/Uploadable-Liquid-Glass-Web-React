# 🫧 Liquid Glass — 液态玻璃折射引擎

> Apple 风格液态玻璃效果 —— 基于 SVG `feDisplacementMap` 折射实时 DOM 的 React 组件

[![Chrome](https://img.shields.io/badge/Chrome-✓-4ade80?style=flat-square)](https://caniuse.com/svg-filters)
[![Safari](https://img.shields.io/badge/Safari-✓-4ade80?style=flat-square)](https://caniuse.com/svg-filters)
[![Firefox](https://img.shields.io/badge/Firefox-✓-4ade80?style=flat-square)](https://caniuse.com/svg-filters)
[![Zero Flags](https://img.shields.io/badge/Zero_Experimental_Flags-✓-6ea8fe?style=flat-square)]()

---

## ✨ 效果预览

移动鼠标到图片上，液态玻璃镜头实时折射背景内容：

```
鼠标移动 → 平滑跟随 → Canvas 生成位移贴图 → feDisplacementMap → 实时折射
```

## 🔥 核心特性

| 特性 | 说明 |
|------|------|
| 🎯 **实时 DOM 折射** | `feDisplacementMap` 直接作用于渲染中的 DOM，非模拟、非截图 |
| ⚡ **Canvas 像素级位移** | 逐像素计算球面折射，smoothstep + Curvature 曲率衰减 |
| 🌈 **Chroma 色散** | 边缘棱镜色散，Splay 控制扩散方向 |
| 🌍 **全浏览器原生** | Chrome / Safari / Firefox 桌面端 + 移动端，零 Feature Flag |
| 🎬 **图片 & 视频** | 静态图片和播放中的视频均可折射 |
| 🎛 **15 维参数** | 10 个镜头参数 + 5 个底图参数，实时调节 |
| 🖱✨ **双模式** | 鼠标跟随 / 自动漫游 (Lissajous 曲线) |

## 🏗 实现架构

```
┌─────────────────────────────────────────────────┐
│  Canvas (隐藏)                                    │
│   → 逐像素生成位移贴图                             │
│   → R 通道 = X 偏移 (128=无, 0=最大负, 255=最大正) │
│   → G 通道 = Y 偏移                               │
│   → toDataURL() → base64 PNG                      │
└────────────────────┬────────────────────────────┘
                     ↓ 注入
┌─────────────────────────────────────────────────┐
│  SVG Filter                                       │
│   → <feImage> 引入位移贴图                         │
│   → <feDisplacementMap> 扭曲 SourceGraphic         │
│   → Strength × 1000 = displacement scale           │
└────────────────────┬────────────────────────────┘
                     ↓ 渲染
┌─────────────────────────────────────────────────┐
│  CSS 玻璃镜头层                                    │
│   → Specular Angle 驱动高光位置                     │
│   → Glow 控制外发光                                │
│   → Edge Highlight 控制边框亮度                     │
│   → Chroma 控制彩虹环                              │
└─────────────────────────────────────────────────┘
```

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/Manji1233/liquid-glass-web-react.git
cd liquid-glass-web-react

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 📂 项目结构

```
liquid-glass-web-react/
├── src/
│   ├── App.jsx                         # 主应用：布局 + 状态管理
│   ├── main.jsx                        # 入口
│   ├── hooks/
│   │   └── useDisplacementMap.jsx      # 核心：位移贴图 + SVG 滤镜 + 镜头视觉
│   └── components/
│       └── ControlPanel.jsx            # 右侧浮动控制面板
├── public/
│   └── swan.jpg                        # 默认底图
├── showcase.html                       # 独立展示页（无需构建）
├── index.html
├── package.json
└── vite.config.js
```

## 🎛 参数说明

### Lens（镜头）

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| Size | 100 | 0 ~ 260 | 镜头半径 (px) |
| Chroma | 0.50 | 0.00 ~ 1.00 | 边缘色散强度 |
| Depth | 26 | 0 ~ 60 | 折射深度 |
| Blur | 0.0 | 0.0 ~ 3.0 | 镜头背景模糊 |
| Edge Highlight | 0.80 | 0.00 ~ 1.00 | 边框 + 高光亮度 |

### Material（材质）

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| Strength | 0.08 | 0.000 ~ 1.000 | 位移强度 (×1000 = feDisplacementMap scale) |
| Curvature | 0.41 | 0.00 ~ 1.00 | 折射衰减曲线 (0=线性, 1=强球面) |
| Splay | 1.00 | 0.00 ~ 1.00 | 边缘色散向外扩散 |
| Glow | 0.80 | 0.00 ~ 1.00 | 镜头外发光强度 |
| Specular Angle | 130° | 0 ~ 180 | 高光方向角度 |

### Background（底图）

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| Brightness | 100% | 20 ~ 200 | 亮度 |
| Contrast | 100% | 20 ~ 200 | 对比度 |
| Saturate | 100% | 0 ~ 300 | 饱和度 |
| Scale | 100% | 50 ~ 200 | 缩放 |
| Radius | 16px | 0 ~ 50 | 圆角 |

## 🧩 核心代码

### 位移贴图生成

```js
// Canvas 逐像素生成位移贴图
const curvExp = 1 + curvature * 3  // 曲率指数: 1(线性) → 4(强球面)
const refractionStrength = Math.pow(1 - smoothT, curvExp)

// R 通道 → X 偏移, G 通道 → Y 偏移 (128 = 无位移)
data[idx]     = 128 + (-nx * refractionStrength * depth * 1.6)
data[idx + 1] = 128 + (-ny * refractionStrength * depth * 1.6)
```

### SVG 滤镜

```jsx
<filter id="liquid-glass" colorInterpolationFilters="sRGB">
  <feImage href="{canvas.toDataURL()}" result="displacementMap" />
  <feDisplacementMap
    in="SourceGraphic"
    in2="displacementMap"
    scale={strength * 1000}
    xChannelSelector="R"
    yChannelSelector="G"
  />
</filter>
```

### 应用到任意元素

```jsx
<div style={{ filter: 'url(#liquid-glass)' }}>
  {children}
</div>
```

## 🔧 技术细节

### 为什么用 feDisplacementMap 而非 WebGL？

| | SVG Filter | WebGL |
|---|---|---|
| **兼容性** | 全浏览器原生 (2003 年标准) | 需 WebGL 支持 |
| **实验性标志** | 不需要 | 部分效果需要 |
| **DOM 折射** | 直接作用于 DOM | 需截图 → 纹理 |
| **视频支持** | 天然支持 | 需逐帧上传纹理 |
| **实现复杂度** | 低 | 高 |

### 位移贴图原理

`feDisplacementMap` 读取贴图像素值来偏移源图像素：

```
偏移公式:
  P'(x,y).x = x + scale × (channelR(x,y) - 128) / 128
  P'(x,y).y = y + scale × (channelG(x,y) - 128) / 128
```

- `R = 128, G = 128` → 无偏移
- `R < 128` → 向左偏移，`R > 128` → 向右偏移
- `G < 128` → 向上偏移，`G > 128` → 向下偏移

### 性能优化

- **降采样**：大屏 0.4x，中屏 0.6x，小屏 1x → 流畅 60fps
- **区域裁剪**：只遍历镜头影响区域的像素
- **requestAnimationFrame**：与屏幕刷新同步
- **Canvas willReadFrequently**：提示浏览器优化 readback

## 🌐 浏览器兼容

| 浏览器 | 桌面 | 移动 |
|--------|------|------|
| Chrome | ✓ | ✓ |
| Safari | ✓ | ✓ |
| Firefox | ✓ | ✓ |

基于 SVG 1.1 `feDisplacementMap` 规范 (2003)，所有现代浏览器均已完整支持。

## 📄 License

MIT

---

**Liquid Glass** · SVG feDisplacementMap · Zero Experimental Flags · React
