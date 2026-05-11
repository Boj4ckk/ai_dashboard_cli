import { useRef, useState, useCallback } from 'react'
import type { FrameProps } from '../types/components'

const HANDLE_SIZE = 8
const MIN_W = 200
const MIN_H = 150

type HandleDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'

const HANDLE_CURSORS: Record<HandleDir, string> = {
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
  nw: 'nwse-resize', se: 'nwse-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
}

const HANDLE_POSITIONS: Record<HandleDir, React.CSSProperties> = {
  n:  { top: -4,  left: '50%', transform: 'translateX(-50%)' },
  s:  { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
  e:  { right: -4, top: '50%', transform: 'translateY(-50%)' },
  w:  { left: -4,  top: '50%', transform: 'translateY(-50%)' },
  nw: { top: -4,  left: -4 },
  ne: { top: -4,  right: -4 },
  sw: { bottom: -4, left: -4 },
  se: { bottom: -4, right: -4 },
}

export function Frame({ frame, index, selected, isDragging, onMouseDown, onResize, onClear }: FrameProps) {
  const [isHovered, setIsHovered] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  const startResize = useCallback((e: React.MouseEvent, dir: HandleDir) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const startW = frame.width
    const startH = frame.height

    function onMove(ev: MouseEvent) {
      let newW = startW
      let newH = startH
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      if (dir.includes('e')) newW = Math.max(MIN_W, startW + dx)
      if (dir.includes('s')) newH = Math.max(MIN_H, startH + dy)
      if (dir.includes('w')) newW = Math.max(MIN_W, startW - dx)
      if (dir.includes('n')) newH = Math.max(MIN_H, startH - dy)

      onResize(Math.round(newW), Math.round(newH))
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [frame.width, frame.height, onResize])

  const isEmpty = frame.status === 'empty'
  const isLoading = frame.status === 'loading'
  const isLocked = frame.status === 'locked'

  const borderStyle = (() => {
    if (isEmpty && selected) return '2px dashed #FF5721'
    if (isEmpty) return '2px dashed #CACAD0'
    if (isLocked && selected) return '2px solid #FF5721'
    return '2px solid #E5E5E7'
  })()

  const bgStyle = (() => {
    if (isEmpty && selected) return '#FFF0EB'
    if (isEmpty) return '#F7F7F8'
    return '#FFFFFF'
  })()

  const boxShadow = isLocked && selected
    ? '0 0 0 3px #FFCAB8'
    : undefined

  const cursor = isDragging ? 'grabbing' : selected ? 'grab' : 'pointer'

  return (
    <div
      ref={frameRef}
      style={{
        position: 'absolute',
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        border: borderStyle,
        background: bgStyle,
        boxShadow,
        borderRadius: 12,
        cursor,
        transition: isDragging ? 'none' : 'border-color 0.12s, box-shadow 0.12s',
        overflow: 'hidden',
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Tag pill ── */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: -26,
            left: 0,
            background: '#FF5721',
            color: '#FFFFFF',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {isEmpty ? 'TARGETED' : `FRAME ${index + 1}`}
        </div>
      )}

      {/* ── Empty placeholder ── */}
      {isEmpty && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#9B9BA8',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          Frame {index + 1}
        </span>
      )}

      {/* ── Loading shimmer ── */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #EFEFEF 25%, #F7F7F8 50%, #EFEFEF 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s ease-in-out infinite',
            borderRadius: 10,
          }}
        />
      )}

      {/* ── Iframe ── */}
      {isLocked && frame.iframeUrl && (
        <iframe
          src={frame.iframeUrl}
          sandbox="allow-scripts"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title={frame.title ?? `Frame ${index + 1}`}
        />
      )}

      {/* ── Close button (locked + hover) ── */}
      {isLocked && isHovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear() }}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'rgba(13,13,13,0.7)',
            color: '#FFFFFF',
            fontSize: 14,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ×
        </button>
      )}

      {/* ── Resize handles (empty only) ── */}
      {isEmpty && selected && (Object.keys(HANDLE_POSITIONS) as HandleDir[]).map(dir => (
        <div
          key={dir}
          onMouseDown={(e) => startResize(e, dir)}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: '#FF5721',
            borderRadius: 2,
            cursor: HANDLE_CURSORS[dir],
            zIndex: 5,
            ...HANDLE_POSITIONS[dir],
          }}
        />
      ))}
    </div>
  )
}
