import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  useDisplacementMap,
  LiquidGlassSVGFilter,
  LiquidGlassLens,
} from './hooks/useDisplacementMap.jsx'
import ControlPanel from './components/ControlPanel.jsx'

/* ─── 默认参数 ─── */
const DEFAULTS = {
  lensRadius: 130,
  displacementScale: 55,
  refractStrength: 85,
  edgeWidth: 22,
  chromaticStrength: 6,
}
const FILTER_ID = 'liquid-glass'

/**
 * App - 苹果液态玻璃 Demo
 *
 * 布局: 居中媒体 (max-width 700px) + 右侧浮动控制面板
 * 支持: 图片 / 视频上传, 拖放上传
 * 交互: 鼠标/触摸移动 → 液态玻璃折射镜头
 */
export default function App() {
  const mediaContainerRef = useRef(null)
  const videoRef = useRef(null)

  /* ─── 参数状态 ─── */
  const [lensRadius, setLensRadius]             = useState(DEFAULTS.lensRadius)
  const [displacementScale, setDisplacementScale] = useState(DEFAULTS.displacementScale)
  const [refractStrength, setRefractStrength]   = useState(DEFAULTS.refractStrength)
  const [edgeWidth, setEdgeWidth]               = useState(DEFAULTS.edgeWidth)
  const [chromaticStrength, setChromaticStrength] = useState(DEFAULTS.chromaticStrength)

  /* ─── 媒体状态 ─── */
  const [mediaSrc, setMediaSrc]       = useState('/swan.jpg')
  const [mediaType, setMediaType]     = useState('image')  // 'image' | 'video'
  const [isLoaded, setIsLoaded]       = useState(false)
  const [mediaAspect, setMediaAspect] = useState(9 / 16)   // height / width

  /* ─── 鼠标/镜头状态 ─── */
  const [mousePos, setMousePos]       = useState({ x: -500, y: -500 })
  const [smoothPos, setSmoothPos]     = useState({ x: -500, y: -500 })
  const [dimensions, setDimensions]   = useState({ width: 0, height: 0 })
  const [isActive, setIsActive]       = useState(false)

  /* ─── 上传处理 ─── */
  const handleUpload = useCallback((file) => {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const url = URL.createObjectURL(file)
    setMediaSrc(url)
    setMediaType(isVideo ? 'video' : 'image')
    setIsLoaded(false)
  }, [])

  /* ─── 重置参数 ─── */
  const handleReset = useCallback(() => {
    setLensRadius(DEFAULTS.lensRadius)
    setDisplacementScale(DEFAULTS.displacementScale)
    setRefractStrength(DEFAULTS.refractStrength)
    setEdgeWidth(DEFAULTS.edgeWidth)
    setChromaticStrength(DEFAULTS.chromaticStrength)
  }, [])

  /* ─── 监听媒体容器尺寸 ─── */
  useEffect(() => {
    const updateSize = () => {
      if (mediaContainerRef.current) {
        const rect = mediaContainerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [isLoaded, mediaAspect])

  /* ─── 媒体加载 → 获取宽高比 ─── */
  const handleImageLoad = useCallback((e) => {
    const img = e.target
    setMediaAspect(img.naturalHeight / img.naturalWidth)
    setIsLoaded(true)
    // 触发尺寸更新
    setTimeout(() => {
      if (mediaContainerRef.current) {
        const rect = mediaContainerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }, 50)
  }, [])

  const handleVideoLoad = useCallback(() => {
    const v = videoRef.current
    if (v) {
      setMediaAspect(v.videoHeight / v.videoWidth)
      setIsLoaded(true)
    }
  }, [])

  /* ─── 平滑跟随鼠标 (lerp) ─── */
  useEffect(() => {
    let rafId
    const lerp = (a, b, t) => a + (b - a) * t
    const animate = () => {
      setSmoothPos(prev => ({
        x: lerp(prev.x, mousePos.x, 0.05),
        y: lerp(prev.y, mousePos.y, 0.05),
      }))
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [mousePos])

  /* ─── 鼠标/触摸事件 ─── */
  const handleMouseMove = useCallback((e) => {
    if (!mediaContainerRef.current) return
    const rect = mediaContainerRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const handleMouseEnter = useCallback(() => setIsActive(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsActive(false)
    setMousePos({ x: -500, y: -500 })
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!mediaContainerRef.current || !touch) return
    const rect = mediaContainerRef.current.getBoundingClientRect()
    setMousePos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top })
  }, [])

  /* ─── 核心: 生成位移贴图 ─── */
  const { canvasRef, feImageRef } = useDisplacementMap({
    width: dimensions.width,
    height: dimensions.height,
    mouseX: smoothPos.x,
    mouseY: smoothPos.y,
    lensRadius,
    refractStrength,
    edgeWidth,
    chromaticStrength,
  })

  /* ─── 计算媒体容器尺寸 (居中, max-width 700px, 保持比例) ─── */
  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: 700,
    aspectRatio: `${1 / mediaAspect}`,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: isLoaded
      ? '0 20px 80px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.3)'
      : 'none',
    transition: 'box-shadow 0.5s ease',
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(145deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        padding: 20,
        overflow: 'hidden',
      }}
    >
      {/* ===== 媒体容器 (居中, max-width 700px) ===== */}
      <div style={containerStyle}>
        <div
          ref={mediaContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchMove}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            cursor: isActive ? 'none' : 'default',
          }}
        >
          {/* 隐藏 Canvas */}
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
          />

          {/* SVG 滤镜 */}
          <LiquidGlassSVGFilter
            feImageRef={feImageRef}
            filterId={FILTER_ID}
            scale={displacementScale}
          />

          {/* 应用位移滤镜的媒体层 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              filter: `url(#${FILTER_ID})`,
              WebkitFilter: `url(#${FILTER_ID})`,
            }}
          >
            {mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={mediaSrc}
                onLoadedMetadata={handleVideoLoad}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              />
            ) : (
              <img
                src={mediaSrc}
                alt="Media"
                onLoad={handleImageLoad}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
                draggable={false}
              />
            )}
          </div>

          {/* 液态玻璃镜头视觉层 */}
          {isActive && (
            <LiquidGlassLens
              mouseX={smoothPos.x}
              mouseY={smoothPos.y}
              radius={lensRadius}
            />
          )}
        </div>
      </div>

      {/* ===== 控制面板 ===== */}
      <ControlPanel
        lensRadius={lensRadius}
        setLensRadius={setLensRadius}
        displacementScale={displacementScale}
        setDisplacementScale={setDisplacementScale}
        refractStrength={refractStrength}
        setRefractStrength={setRefractStrength}
        edgeWidth={edgeWidth}
        setEdgeWidth={setEdgeWidth}
        chromaticStrength={chromaticStrength}
        setChromaticStrength={setChromaticStrength}
        onUpload={handleUpload}
        onReset={handleReset}
        mediaType={mediaType}
      />

      {/* ===== 底部提示 ===== */}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 200,
        }}
      >
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
          letterSpacing: 0.3,
        }}>
          移动鼠标到图片上探索折射 · 右侧面板调节参数
        </div>
      </div>
    </div>
  )
}
