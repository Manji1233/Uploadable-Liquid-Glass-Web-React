import React, { useState, useRef } from 'react'

/* ─── 滑块控件 ─── */
function Slider({ label, value, min, max, step = 1, unit = '', onChange }) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: 10, fontFamily: "'SF Mono','Fira Code',monospace",
          color: 'rgba(255,255,255,0.4)', minWidth: 48, textAlign: 'right',
        }}>
          {typeof value === 'number' && step < 1 ? value.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1) : value}{unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: 0, width: `${percent}%`, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, rgba(110,168,254,0.5), rgba(192,132,252,0.5))' }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'relative', width: '100%', height: 20, margin: 0, padding: 0, WebkitAppearance: 'none', appearance: 'none', background: 'transparent', outline: 'none', cursor: 'pointer' }}
        />
      </div>
      <style>{`
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer}
        input[type="range"]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;border:none;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer}
      `}</style>
    </div>
  )
}

/* ─── 参数组标题 ─── */
function GroupLabel({ children, color = 'rgba(110,168,254,0.7)' }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: 1.2, color,
      marginTop: 14, marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

/* ─── 右侧浮动控制面板 ─── */
export default function ControlPanel({
  // Lens
  size, setSize,
  chroma, setChroma,
  depth, setDepth,
  blur, setBlur,
  edgeHighlight, setEdgeHighlight,
  // Material
  strength, setStrength,
  curvature, setCurvature,
  splay, setSplay,
  glow, setGlow,
  specularAngle, setSpecularAngle,
  // Background
  bgBrightness, setBgBrightness,
  bgContrast, setBgContrast,
  bgSaturate, setBgSaturate,
  bgScale, setBgScale,
  bgRadius, setBgRadius,
  // Other
  onUpload, onReset,
  mediaType,
  moveMode, setMoveMode,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onUpload) onUpload(file)
    e.target.value = ''
  }

  /* ─── 折叠时只显示小按钮 ─── */
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 500,
          width: 40, height: 40, borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(28,28,30,0.7)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          color: 'rgba(255,255,255,0.8)', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        title="展开控制面板"
      >⚙</button>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 400,
      width: 260,
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      background: 'rgba(28, 28, 30, 0.78)',
      backdropFilter: 'blur(30px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: 18,
      color: '#fff',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    }}>
      {/* ── 标题栏 ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          🫧 Liquid Glass
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 15, padding: 4, lineHeight: 1 }}
        >✕</button>
      </div>

      {/* ── 上传区 ── */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files?.[0]; if (f && onUpload) onUpload(f) }}
        style={{
          border: '1.5px dashed rgba(255,255,255,0.12)',
          borderRadius: 10,
          padding: '12px 10px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 14,
          transition: 'border-color 0.2s, background 0.2s',
          background: 'rgba(255,255,255,0.02)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(110,168,254,0.35)'; e.currentTarget.style.background = 'rgba(110,168,254,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      >
        <div style={{ fontSize: 20, marginBottom: 3 }}>📁</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          点击或拖放上传图片/视频
        </div>
        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
          当前: {mediaType === 'video' ? '视频' : '图片'} · JPG / PNG / MP4 / WebM
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      {/* ── 模式切换 ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <button
          onClick={() => setMoveMode('mouse')}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: 'pointer',
            border: '1px solid ' + (moveMode === 'mouse' ? 'rgba(110,168,254,0.4)' : 'rgba(255,255,255,0.08)'),
            background: moveMode === 'mouse' ? 'rgba(110,168,254,0.12)' : 'rgba(255,255,255,0.03)',
            color: moveMode === 'mouse' ? 'rgba(110,168,254,0.9)' : 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
          }}
        >🖱 鼠标移动</button>
        <button
          onClick={() => setMoveMode('auto')}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: 'pointer',
            border: '1px solid ' + (moveMode === 'auto' ? 'rgba(192,132,252,0.4)' : 'rgba(255,255,255,0.08)'),
            background: moveMode === 'auto' ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.03)',
            color: moveMode === 'auto' ? 'rgba(192,132,252,0.9)' : 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
          }}
        >✨ 自动移动</button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0 0' }} />

      {/* ── Lens ── */}
      <GroupLabel>Lens</GroupLabel>
      <Slider label="Size" value={size} min={0} max={260} step={1} unit="px" onChange={setSize} />
      <Slider label="Chroma" value={chroma} min={0} max={1} step={0.01} onChange={setChroma} />
      <Slider label="Depth" value={depth} min={0} max={60} step={1} onChange={setDepth} />
      <Slider label="Blur" value={blur} min={0} max={3} step={0.1} onChange={setBlur} />
      <Slider label="Edge Highlight" value={edgeHighlight} min={0} max={1} step={0.01} onChange={setEdgeHighlight} />

      {/* ── Material ── */}
      <GroupLabel>Material</GroupLabel>
      <Slider label="Strength" value={strength} min={0} max={1} step={0.001} onChange={setStrength} />
      <Slider label="Curvature" value={curvature} min={0} max={1} step={0.01} onChange={setCurvature} />
      <Slider label="Splay" value={splay} min={0} max={1} step={0.01} onChange={setSplay} />
      <Slider label="Glow" value={glow} min={0} max={1} step={0.01} onChange={setGlow} />
      <Slider label="Specular Angle" value={specularAngle} min={0} max={180} step={1} unit="°" onChange={setSpecularAngle} />

      {/* ── Background ── */}
      <GroupLabel color="rgba(134,239,172,0.7)">Background</GroupLabel>
      <Slider label="Brightness" value={bgBrightness} min={20} max={200} step={1} unit="%" onChange={setBgBrightness} />
      <Slider label="Contrast" value={bgContrast} min={20} max={200} step={1} unit="%" onChange={setBgContrast} />
      <Slider label="Saturate" value={bgSaturate} min={0} max={300} step={1} unit="%" onChange={setBgSaturate} />
      <Slider label="Scale" value={bgScale} min={50} max={200} step={1} unit="%" onChange={setBgScale} />
      <Slider label="Radius" value={bgRadius} min={0} max={50} step={1} unit="px" onChange={setBgRadius} />

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0 12px' }} />

      {/* ── 重置 ── */}
      <button
        onClick={onReset}
        style={{
          width: '100%', padding: '7px 0', borderRadius: 9,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
      >↺ 恢复默认参数</button>

      <div style={{
        marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center',
        fontFamily: "'SF Mono','Fira Code',monospace", lineHeight: 1.6,
      }}>
        SVG feDisplacementMap<br/>Chrome ✓ Safari ✓ Firefox ✓
      </div>
    </div>
  )
}
