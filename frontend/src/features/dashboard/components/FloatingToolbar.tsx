import { useState, useRef, useEffect, useCallback } from 'react'
import type { FloatingToolbarProps } from '../types/components'

export function FloatingToolbar({ activeTool, onSelectTool, anchorRef }: FloatingToolbarProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pos !== null) return
    const btn = anchorRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPos({ x: rect.left, y: rect.bottom + 8 })
  }, [anchorRef, pos])

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = toolbarRef.current?.getBoundingClientRect()
    if (!rect) return
    isDragging.current = true
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return
      setPos({ x: ev.clientX - dragOffset.current.x, y: ev.clientY - dragOffset.current.y })
    }
    function onUp() {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  if (!pos) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-40 flex items-center rounded-xl select-none"
      style={{
        left: pos.x,
        top: pos.y,
        backdropFilter: 'blur(40px) saturate(200%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))',
        border: '0.5px solid rgba(255,255,255,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)',
        padding: '4px',
        gap: '2px',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center w-5 h-10 cursor-grab active:cursor-grabbing rounded-lg mr-1"
        style={{ color: '#CACAD0' }}
        onMouseDown={handleDragStart}
      >
        <DragDotsIcon />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border-subtle mx-1" />

      {/* Iframe tool */}
      <div className="relative group">
        <button
          onClick={() => onSelectTool(activeTool === 'iframe' ? null : 'iframe')}
          className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-100"
          style={
            activeTool === 'iframe'
              ? { background: '#FFF0EB', border: '1.5px solid #FF5721', color: '#FF5721' }
              : { background: 'transparent', border: '1.5px solid transparent', color: '#666677' }
          }
          onMouseEnter={e => {
            if (activeTool !== 'iframe') (e.currentTarget as HTMLButtonElement).style.background = '#F7F7F8'
          }}
          onMouseLeave={e => {
            if (activeTool !== 'iframe') (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <IframeIcon />
        </button>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[11px] font-medium text-text-inverted opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
          Create frame
        </span>
      </div>
    </div>
  )
}

function DragDotsIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <circle cx="2" cy="2" r="1.2" fill="currentColor" />
      <circle cx="6" cy="2" r="1.2" fill="currentColor" />
      <circle cx="2" cy="7" r="1.2" fill="currentColor" />
      <circle cx="6" cy="7" r="1.2" fill="currentColor" />
      <circle cx="2" cy="12" r="1.2" fill="currentColor" />
      <circle cx="6" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

function IframeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="3.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 8.5L13.5 8.5M13.5 8.5L12 7M13.5 8.5L12 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 6V5a1 1 0 0 0-1-1h-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14.5 11v1a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
