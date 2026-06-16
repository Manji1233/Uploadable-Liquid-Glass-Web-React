import React, { useRef, useEffect, useCallback } from 'react'

/**
 * useDisplacementMap - 核心位移贴图生成 Hook
 *
 * Canvas 逐像素生成位移贴图 → toDataURL → SVG feImage → feDisplacementMap
 * R 通道编码 X 偏移, G 通道编码 Y 偏移 (128=无位移)
 */
export function useDisplacementMap({
  width,
  height,
  mouseX,
  mouseY,
  lensRadius,
  refractStrength = 85,
  edgeWidth = 22,
  chromaticStrength = 6,
}) {
  const canvasRef = useRef(null)
  const feImageRef = useRef(null)
  const rafRef = useRef(0)

  const generateMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0 || height === 0) return

    const dpr = width > 1000 ? 0.4 : width > 600 ? 0.6 : 1
    const w = Math.floor(width * dpr)
    const h = Math.floor(height * dpr)
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const imageData = ctx.createImageData(w, h)
    const data = imageData.data

    const cx = mouseX * dpr
    const cy = mouseY * dpr
    const r = lensRadius * dpr
    const ew = edgeWidth * dpr
    const cap = refractStrength

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128
      data[i + 1] = 128
      data[i + 2] = 128
      data[i + 3] = 255
    }

    const minX = Math.max(0, Math.floor(cx - r - ew))
    const maxX = Math.min(w - 1, Math.ceil(cx + r + ew))
    const minY = Math.max(0, Math.floor(cy - r - ew))
    const maxY = Math.min(h - 1, Math.ceil(cy + r + ew))

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const idx = (py * w + px) * 4
        const dx = px - cx
        const dy = py - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < r) {
          const t = dist / r
          const smoothT = t * t * (3 - 2 * t)
          const strength = (1 - smoothT) * (1 - smoothT)

          const invDist = dist > 0.5 ? 1 / dist : 0
          const nx = dx * invDist
          const ny = dy * invDist

          const dispX = -nx * strength * cap
          const dispY = -ny * strength * cap

          data[idx]     = Math.round(Math.max(0, Math.min(255, 128 + dispX)))
          data[idx + 1] = Math.round(Math.max(0, Math.min(255, 128 + dispY)))
        } else if (dist < r + ew && chromaticStrength > 0) {
          const edgeT = (dist - r) / ew
          const fade = (1 - edgeT) * (1 - edgeT)
          const invDist = dist > 0.5 ? 1 / dist : 0
          const nx = dx * invDist
          const ny = dy * invDist

          const chromatic = fade * chromaticStrength
          data[idx]     = Math.round(128 + nx * chromatic)
          data[idx + 1] = Math.round(128 + ny * chromatic)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    const feImg = feImageRef.current
    if (feImg) {
      const dataUrl = canvas.toDataURL('image/png')
      feImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
      feImg.setAttribute('href', dataUrl)
    }
  }, [mouseX, mouseY, lensRadius, refractStrength, edgeWidth, chromaticStrength, width, height])

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(generateMap)
    return () => cancelAnimationFrame(rafRef.current)
  }, [generateMap])

  return { canvasRef, feImageRef }
}

/**
 * LiquidGlassSVGFilter - SVG 滤镜
 */
export function LiquidGlassSVGFilter({
  feImageRef,
  filterId = 'liquid-glass',
  scale = 55,
}) {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={filterId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            ref={feImageRef}
            result="displacementMap"
            preserveAspectRatio="none"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

/**
 * LiquidGlassLens - 液态玻璃镜头视觉层
 */
export function LiquidGlassLens({
  mouseX = 0,
  mouseY = 0,
  radius = 130,
}) {
  return (
    <div
      className="liquid-glass-lens"
      style={{
        position: 'absolute',
        left: mouseX - radius,
        top: mouseY - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 100,
        background: `
          radial-gradient(
            ellipse at 32% 28%,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.12) 20%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(0, 0, 0, 0.04) 70%,
            rgba(0, 0, 0, 0.10) 100%
          )
        `,
        border: '1.5px solid rgba(255, 255, 255, 0.35)',
        boxShadow: `
          0 0 0 0.5px rgba(255, 255, 255, 0.12),
          0 10px 50px rgba(0, 0, 0, 0.5),
          0 4px 16px rgba(0, 0, 0, 0.3),
          inset 0 1.5px 0 rgba(255, 255, 255, 0.5),
          inset 0 -1px 0 rgba(255, 255, 255, 0.06),
          inset 1px 0 0 rgba(255, 255, 255, 0.08),
          inset -1px 0 0 rgba(255, 255, 255, 0.08)
        `,
        backdropFilter: 'blur(1.5px) saturate(1.5) brightness(1.06)',
        WebkitBackdropFilter: 'blur(1.5px) saturate(1.5) brightness(1.06)',
      }}
    >
      <div style={{
        position: 'absolute', left: '10%', top: '6%', width: '55%', height: '32%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: '22%', bottom: '10%', width: '40%', height: '18%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.1) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: -4, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: -1, borderRadius: '50%',
        background: `conic-gradient(from 200deg, transparent 0deg, rgba(255,100,100,0.04) 60deg, rgba(100,255,100,0.03) 120deg, rgba(100,100,255,0.04) 180deg, rgba(255,200,100,0.03) 240deg, transparent 360deg)`,
        pointerEvents: 'none',
      }} />
    </div>
  )
}
