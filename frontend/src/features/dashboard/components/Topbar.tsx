import { useRef } from 'react'
import type { TopbarProps } from '../types/components'

export function Topbar({
  title,
  onTitleChange,
  zoom,
  onZoomIn,
  onZoomOut,
  toolbarOpen,
  onToggleToolbar,
  toolbarButtonRef,
  selectedFrameId,
  onDeleteFrame,
}: TopbarProps) {
  const titleRef = useRef<HTMLSpanElement>(null)

  function handleTitleBlur() {
    const val = titleRef.current?.textContent?.trim() ?? ''
    onTitleChange(val || 'Untitled')
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleRef.current?.blur()
    }
  }

  const canDelete = selectedFrameId !== null

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-3 gap-3"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid #E5E5E7',
        backgroundColor: 'rgba(255,255,255,0.72)',
      }}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-2 min-w-0">

        {/* Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-[18px] h-[18px] rounded-sm bg-text-primary flex items-center justify-center">
            <span className="text-[9px] font-bold leading-none text-text-inverted font-mono">P</span>
          </div>
        </div>

        {/* Editable title */}
        <div className="flex items-center gap-1 min-w-0 text-sm text-text-secondary">
          <span className="shrink-0">poc dashboard /</span>
          <span
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="outline-none rounded px-0.5 cursor-text truncate max-w-[160px] text-text-primary hover:bg-bg-muted focus:bg-bg-muted transition-colors duration-100"
            style={{ minWidth: '40px' }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right — Zoom + tools + delete ── */}
      <div className="flex items-center gap-1 text-text-muted">
        <button
          onClick={onZoomOut}
          className="w-6 h-6 flex items-center justify-center rounded text-sm transition-colors duration-100 hover:text-text-primary"
          title="Zoom out"
        >
          −
        </button>
        <span className="text-xs font-mono w-10 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="w-6 h-6 flex items-center justify-center rounded text-sm transition-colors duration-100 hover:text-text-primary"
          title="Zoom in"
        >
          +
        </button>

        {/* Separator */}
        <div className="w-px h-4 bg-border-subtle mx-1" />

        {/* Toolbar toggle */}
        <div className="relative group">
          <button
            ref={toolbarButtonRef}
            onClick={onToggleToolbar}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-100"
            style={{ color: toolbarOpen ? '#FF5721' : '#9B9BA8' }}
            onMouseEnter={e => { if (!toolbarOpen) (e.currentTarget as HTMLButtonElement).style.color = '#0D0D0D' }}
            onMouseLeave={e => { if (!toolbarOpen) (e.currentTarget as HTMLButtonElement).style.color = toolbarOpen ? '#FF5721' : '#9B9BA8' }}
          >
            <ToolsIcon />
          </button>
          <span className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[11px] font-medium text-text-inverted opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
            Tools
          </span>
        </div>

        {/* Delete frame */}
        <div className="relative group">
          <button
            onClick={() => { if (canDelete) onDeleteFrame(selectedFrameId!) }}
            disabled={!canDelete}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-100"
            style={{
              color: canDelete ? '#DC2626' : '#CACAD0',
              cursor: canDelete ? 'pointer' : 'default',
            }}
          >
            <TrashIcon />
          </button>
          {canDelete && (
            <span className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[11px] font-medium text-text-inverted opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Delete frame
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

function ToolsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 2.5C9.5 2.5 10.5 1.5 12 1.5C13.5 1.5 14.5 2.5 14.5 4C14.5 5.5 13.5 6.5 12 6.5C11.2 6.5 10.5 6.2 10 5.7L4.5 11.2C4.8 11.6 5 12.1 5 12.7C5 13.9 4 15 2.8 15C1.6 15 0.5 14 0.5 12.7C0.5 11.5 1.5 10.5 2.8 10.5C3.3 10.5 3.8 10.7 4.2 11L9.7 5.5C9.6 5.2 9.5 4.8 9.5 4.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.5 3.5L4 6L5.5 4.5L3 2L1.5 3.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="2.8" cy="12.7" r="1" fill="currentColor"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 1.5H9.5M1.5 3.5H13.5M12.5 3.5L11.75 12.57C11.69 13.1 11.24 13.5 10.71 13.5H4.29C3.76 13.5 3.31 13.1 3.25 12.57L2.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6.5V10.5M9 6.5V10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
