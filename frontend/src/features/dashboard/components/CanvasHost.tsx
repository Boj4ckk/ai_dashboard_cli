import { useRef, useCallback, useEffect, useState } from 'react'
import type { CanvasHostProps } from '../types/components'
import type { FrameData } from '../types/frame'
import { Frame } from './Frame'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 2.0
const ZOOM_STEP = 0.05

const FRAME_MIN_W = 200
const FRAME_MIN_H = 150
const FRAME_MAX_W = 1600
const FRAME_MAX_H = 1200

interface DrawRect {
  x: number
  y: number
  w: number
  h: number
}

export function CanvasHost({
  frames,
  selectedFrameId,
  zoom,
  pan,
  activeTool,
  onPanChange,
  onZoomChange,
  onSelectFrame,
  onResizeFrame,
  onClearFrame,
  onAddFrame,
  onMoveFrame,
  onToolUsed,
}: CanvasHostProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const panRef = useRef(pan)
  panRef.current = pan
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const activeToolRef = useRef(activeTool)
  activeToolRef.current = activeTool
  const selectedFrameIdRef = useRef(selectedFrameId)
  selectedFrameIdRef.current = selectedFrameId

  // iframe draw state
  const [drawRect, setDrawRect] = useState<DrawRect | null>(null)
  const drawRectRef = useRef<DrawRect | null>(null)
  const drawOrigin = useRef<{ x: number; y: number } | null>(null)
  const isDrawing = useRef(false)

  // frame drag state
  const isDraggingFrame = useRef(false)
  const draggingFrameId = useRef<string | null>(null)
  const dragFrameOrigin = useRef<{ mouseX: number; mouseY: number; frameX: number; frameY: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        onZoomChange(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomRef.current + delta)))
      } else {
        onPanChange({ x: panRef.current.x - e.deltaX, y: panRef.current.y - e.deltaY })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onZoomChange, onPanChange])

  function screenToCanvas(sx: number, sy: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: (sx - rect.left - panRef.current.x) / zoomRef.current,
      y: (sy - rect.top - panRef.current.y) / zoomRef.current,
    }
  }

  const startPan = useCallback((x: number, y: number) => {
    isPanning.current = true
    lastPos.current = { x, y }
  }, [])

  const movePan = useCallback(
    (x: number, y: number) => {
      if (!isPanning.current) return
      const dx = x - lastPos.current.x
      const dy = y - lastPos.current.y
      lastPos.current = { x, y }
      onPanChange({ x: pan.x + dx, y: pan.y + dy })
    },
    [pan, onPanChange],
  )

  const stopPan = useCallback(() => {
    isPanning.current = false
  }, [])

  // Called when mousedown on a selected frame's surface
  function startFrameDrag(e: React.MouseEvent, frame: FrameData) {
    e.preventDefault()
    e.stopPropagation()
    isDraggingFrame.current = true
    draggingFrameId.current = frame.id
    dragFrameOrigin.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      frameX: frame.x,
      frameY: frame.y,
    }
    setDraggingId(frame.id)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeToolRef.current === 'iframe') {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        const origin = screenToCanvas(e.clientX, e.clientY)
        drawOrigin.current = origin
        isDrawing.current = true
        setDrawRect({ x: origin.x, y: origin.y, w: 0, h: 0 })
        return
      }
      if (e.altKey && e.button === 0) {
        e.preventDefault()
        startPan(e.clientX, e.clientY)
      } else if (e.button === 1) {
        e.preventDefault()
        startPan(e.clientX, e.clientY)
      }
    },
    [startPan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDraggingFrame.current && draggingFrameId.current && dragFrameOrigin.current) {
        const dx = (e.clientX - dragFrameOrigin.current.mouseX) / zoomRef.current
        const dy = (e.clientY - dragFrameOrigin.current.mouseY) / zoomRef.current
        onMoveFrame(
          draggingFrameId.current,
          Math.round(dragFrameOrigin.current.frameX + dx),
          Math.round(dragFrameOrigin.current.frameY + dy),
        )
        return
      }
      if (isDrawing.current && drawOrigin.current) {
        const cur = screenToCanvas(e.clientX, e.clientY)
        const rawW = cur.x - drawOrigin.current.x
        const rawH = cur.y - drawOrigin.current.y
        const x = rawW >= 0 ? drawOrigin.current.x : drawOrigin.current.x + rawW
        const y = rawH >= 0 ? drawOrigin.current.y : drawOrigin.current.y + rawH
        const w = Math.min(Math.abs(rawW), FRAME_MAX_W)
        const h = Math.min(Math.abs(rawH), FRAME_MAX_H)
        drawRectRef.current = { x, y, w, h }
        setDrawRect({ x, y, w, h })
        return
      }
      movePan(e.clientX, e.clientY)
    },
    [movePan, onMoveFrame],
  )

  const onAddFrameRef = useRef(onAddFrame)
  onAddFrameRef.current = onAddFrame
  const onToolUsedRef = useRef(onToolUsed)
  onToolUsedRef.current = onToolUsed

  const handleMouseUp = useCallback(() => {
    if (isDraggingFrame.current) {
      isDraggingFrame.current = false
      draggingFrameId.current = null
      dragFrameOrigin.current = null
      setDraggingId(null)
      return
    }
    if (isDrawing.current && drawOrigin.current) {
      isDrawing.current = false
      drawOrigin.current = null
      const rect = drawRectRef.current
      drawRectRef.current = null
      setDrawRect(null)
      if (rect && rect.w >= FRAME_MIN_W && rect.h >= FRAME_MIN_H) {
        onAddFrameRef.current({
          id: crypto.randomUUID(),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.w),
          height: Math.round(rect.h),
          status: 'empty',
        })
        onToolUsedRef.current()
      }
      return
    }
    stopPan()
  }, [stopPan])

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onSelectFrame(null)
    },
    [onSelectFrame],
  )

  // If selectedFrameId no longer exists in frames, treat as null
  const resolvedSelectedId = frames.some(f => f.id === selectedFrameId) ? selectedFrameId : null

  const cursor = activeTool === 'iframe' ? 'crosshair' : draggingId ? 'grabbing' : 'default'

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        backgroundImage: 'radial-gradient(circle, #CACAD0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        cursor,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={stopPan}
      onClick={handleBackgroundClick}
    >
      <div
        style={{
          width: 8000,
          height: 8000,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'relative',
        }}
        onClick={handleBackgroundClick}
      >
        {frames.map((frame, i) => {
          const isSelected = resolvedSelectedId === frame.id
          const isDragging = draggingId === frame.id

          return (
            <Frame
              key={frame.id}
              frame={frame}
              index={i}
              selected={isSelected}
              isDragging={isDragging}
              onMouseDown={(e) => {
                if (e.button !== 0) return
                e.stopPropagation()
                if (isSelected) {
                  startFrameDrag(e, frame)
                } else {
                  onSelectFrame(frame.id)
                }
              }}
              onResize={(w, h) => onResizeFrame(frame.id, w, h)}
              onClear={() => onClearFrame(frame.id)}
            />
          )
        })}

        {/* Draw preview */}
        {drawRect && drawRect.w > 0 && drawRect.h > 0 && (
          <div
            style={{
              position: 'absolute',
              left: drawRect.x,
              top: drawRect.y,
              width: drawRect.w,
              height: drawRect.h,
              border: '1.5px dashed #FF5721',
              background: 'rgba(255,87,33,0.08)',
              borderRadius: '12px',
              pointerEvents: 'none',
            }}
          >
            {drawRect.w >= 60 && drawRect.h >= 40 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -26,
                  right: 0,
                  background: '#FF5721',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  padding: '2px 7px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {Math.round(drawRect.w)} × {Math.round(drawRect.h)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}