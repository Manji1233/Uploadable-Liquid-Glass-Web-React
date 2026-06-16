import React, { useState, useRef } from 'react'

/**
 * Slider - 苹果风格滑块控件
 */
function Slider({ label, value, min, max, step = 1, unit = '', onChange }) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 6,
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{
          fontSize: 11, fontFamily: "'SF Mono','Fira Code',monospace",
          color: 'rgba(255,255,255,0.45)', minWidth: 48, textAlign: 'right',
        }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center' }}>
        {/* 轨道背景 */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
        }} />
        {/* 已填充轨道 */}
        <div style={{
          position: 'absolute', left: 0, width: `${percent}%`, height: 4, borderRadius: 2,
          background: 'linear-gradient(90deg, rgba(100,180,255,0.6), rgba(160,120,255,0.6))',
        }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'relative', width: '100%', height: 22,
            margin: 0, padding: 0,
            WebkitAppearance: 'none', appearance: 'none',
            background: 'transparent', outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%; border: none;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(0,0,0,0.1);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

/**
 * ControlPanel - 液态玻璃参数调节面板
 */
export default function ControlPanel({
  lensRadius, setLensRadius,
  displacementScale, setDisplacementScale,
  refractStrength, setRefractStrength,
  edgeWidth, setEdgeWidth,
  chromaticStrength, setChromaticStrength,
  onUpload, onReset,
  mediaType,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onUpload) onUpload(file)
    e.target.value = ''
  }

  return (
    <>
      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 500,
          width: 40, height: 40, borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(30,30,30,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease',
        }}
        title={collapsed ? '展开控制面板' : '收起控制面板'}
      >
        {collapsed ? '⚙' : '✕'}
      </button>

      {/* 面板 */}
      {!collapsed && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 400,
          width: 280,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: 'rgba(28, 28, 30, 0.75)',
          backdropFilter: 'blur(30px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 20,
          color: 'white',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          {/* 标题 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 18,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              🫧 Liquid Glass
            </div>
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* 上传区 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
            onDrop={e => {
              e.preventDefault(); e.stopPropagation()
              const file = e.dataTransfer.files?.[0]
              if (file && onUpload) onUpload(file)
            }}
            style={{
              border: '1.5px dashed rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '14px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 18,
              transition: 'border-color 0.2s, background 0.2s',
              background: 'rgba(255,255,255,0.03)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(100,180,255,0.4)'
              e.currentTarget.style.background = 'rgba(100,180,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>📁</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              点击或拖放上传图片/视频
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {mediaType === 'video' ? '当前: 视频' : '当前: 图片'}
              &nbsp;·&nbsp;JPG / PNG / GIF / MP4 / WebM
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* 分割线 */}
          <div style={{
            height: 1, background: 'rgba(255,255,255,0.06)',
            margin: '0 -4px 16px',
          }} />

          {/* 滑块组 */}
          <Slider
            label="镜头半径"
            value={lensRadius}
            min={40}
            max={250}
            unit="px"
            onChange={setLensRadius}
          />
          <Slider
            label="位移强度"
            value={displacementScale}
            min={5}
            max={120}
            unit=""
            onChange={setDisplacementScale}
          />
          <Slider
            label="折射强度"
            value={refractStrength}
            min={10}
            max={160}
            unit=""
            onChange={setRefractStrength}
          />
          <Slider
            label="边缘宽度"
            value={edgeWidth}
            min={0}
            max={60}
            unit="px"
            onChange={setEdgeWidth}
          />
          <Slider
            label="色散强度"
            value={chromaticStrength}
            min={0}
            max={20}
            step={0.5}
            unit=""
            onChange={setChromaticStrength}
          />

          {/* 分割线 */}
          <div style={{
            height: 1, background: 'rgba(255,255,255,0.06)',
            margin: '4px -4px 14px',
          }} />

          {/* 重置按钮 */}
          <button
            onClick={onReset}
            style={{
              width: '100%', padding: '8px 0', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
            }}
          >
            ↺ 恢复默认参数
          </button>

          {/* 底部说明 */}
          <div style={{
            marginTop: 14, fontSize: 9.5,
            color: 'rgba(255,255,255,0.25)', textAlign: 'center',
            fontFamily: "'SF Mono','Fira Code',monospace",
            lineHeight: 1.6,
          }}>
            SVG feDisplacementMap<br />
            Chrome ✓ Safari ✓ Firefox ✓
          </div>
        </div>
      )}
    </>
  )
}
