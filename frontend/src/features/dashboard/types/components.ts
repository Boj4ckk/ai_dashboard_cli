import type React from 'react'
import type { FrameData, ActiveTool } from './frame'
import type { Message, ToolTrace } from './agent'

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

export interface RenderFrameContext {
  frame: FrameData
  index: number
  isSelected: boolean
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export interface FrameProps {
  frame: FrameData
  index: number
  selected: boolean
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onResize: (width: number, height: number) => void
  onClear: () => void
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

export interface FloatingToolbarProps {
  activeTool: ActiveTool
  onSelectTool: (tool: ActiveTool) => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}

export interface CanvasMoveEvent {
  id: string
  x: number
  y: number
}

export interface PromptBarProps {
  selectedFrame: FrameData | null
  onDeselectFrame: () => void
  onSubmit: (prompt: string) => void
  agentState: 'idle' | 'thinking' | 'done'
  onOpenModal: () => void
}

export interface AgentModalProps {
  open: boolean
  onClose: () => void
  conversation: Message[]
  agentState: 'idle' | 'thinking' | 'done'
  traces: ToolTrace[]
}
