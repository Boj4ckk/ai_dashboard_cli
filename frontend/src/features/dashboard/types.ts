import type React from 'react'

export type FrameStatus = 'empty' | 'loading' | 'locked'

export type ActiveTool = 'iframe' | null

export interface FrameData {
  id: string
  x: number
  y: number
  width: number
  height: number
  status: FrameStatus
  iframeUrl?: string
  title?: string
}

export interface CanvasHostProps {
  frames: FrameData[]
  selectedFrameId: string | null
  zoom: number
  pan: { x: number; y: number }
  activeTool: ActiveTool
  onPanChange: (pan: { x: number; y: number }) => void
  onZoomChange: (zoom: number) => void
  onSelectFrame: (id: string | null) => void
  onResizeFrame: (id: string, w: number, h: number) => void
  onClearFrame: (id: string) => void
  onAddFrame: (frame: FrameData) => void
  onMoveFrame: (id: string, x: number, y: number) => void
  onDeleteFrame: (id: string) => void
  onToolUsed: () => void
}

export interface TopbarProps {
  title: string
  onTitleChange: (t: string) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  toolbarOpen: boolean
  onToggleToolbar: () => void
  toolbarButtonRef: React.RefObject<HTMLButtonElement | null>
  selectedFrameId: string | null
  onDeleteFrame: (id: string) => void
}

export interface CanvasMoveEvent {
  id: string
  x: number
  y: number
}

export interface FloatingToolbarProps {
  activeTool: ActiveTool
  onSelectTool: (tool: ActiveTool) => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolTrace {
  tool: string
  detail: string
  timing?: string
  status: 'done' | 'active'
}