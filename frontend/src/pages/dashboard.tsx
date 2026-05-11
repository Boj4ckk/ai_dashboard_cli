import { useRef, useState } from 'react'
import { CanvasHost } from '../features/dashboard/components/CanvasHost'
import { Topbar } from '../features/dashboard/components/Topbar'
import { FloatingToolbar } from '../features/dashboard/components/FloatingToolbar'
import { Frame } from '../features/dashboard/components/Frame'
import { PromptBar } from '../features/dashboard/components/PromptBar'
import { AgentModal } from '../features/dashboard/components/AgentModal'
import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import type { ActiveTool } from '../features/dashboard/types/frame'

const ZOOM_STEP = 0.1
const ZOOM_MIN = 0.25
const ZOOM_MAX = 2.0

export function DashboardPage() {
  const [zoom, setZoom] = useState(0.85)
  const [pan, setPan] = useState({ x: 40, y: 20 })
  const [title, setTitle] = useState('Q3 Sales')
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)

  const toolbarButtonRef = useRef<HTMLButtonElement>(null)

  const {
    frames,
    selectedFrameId,
    selectedFrame,
    setSelectedFrameId,
    handleAddFrame,
    handleDeleteFrame,
    handleClearFrame,
    handleMoveFrame,
    handleResizeFrame,
    agentState,
    conversation,
    traces,
    modalOpen,
    handleSubmit,
    openModal,
    closeModal,
  } = useDashboard()

  function handleZoomChange(next: number) {
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)))
  }

  return (
    <div className="relative h-screen bg-bg-base overflow-hidden">

      <Topbar
        title={title}
        onTitleChange={setTitle}
        zoom={zoom}
        onZoomIn={() => handleZoomChange(zoom + ZOOM_STEP)}
        onZoomOut={() => handleZoomChange(zoom - ZOOM_STEP)}
        toolbarOpen={toolbarOpen}
        onToggleToolbar={() => setToolbarOpen(v => !v)}
        toolbarButtonRef={toolbarButtonRef}
        selectedFrameId={selectedFrameId}
        onDeleteFrame={handleDeleteFrame}
      />

      {toolbarOpen && (
        <FloatingToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          anchorRef={toolbarButtonRef}
        />
      )}

      <div className="absolute inset-0 top-12">
        <CanvasHost
          frames={frames}
          selectedFrameId={selectedFrameId}
          zoom={zoom}
          pan={pan}
          activeTool={activeTool}
          onPanChange={setPan}
          onZoomChange={handleZoomChange}
          onSelectFrame={setSelectedFrameId}
          onResizeFrame={handleResizeFrame}
          onClearFrame={handleClearFrame}
          onAddFrame={handleAddFrame}
          onMoveFrame={handleMoveFrame}
          onDeleteFrame={handleDeleteFrame}
          onToolUsed={() => setActiveTool(null)}
          renderFrame={(frame, index, isSelected, isDragging, onMouseDown) => (
            <Frame
              key={frame.id}
              frame={frame}
              index={index}
              selected={isSelected}
              isDragging={isDragging}
              onMouseDown={onMouseDown}
              onResize={(w, h) => handleResizeFrame(frame.id, w, h)}
              onClear={() => handleClearFrame(frame.id)}
            />
          )}
        />
      </div>

      <PromptBar
        selectedFrame={selectedFrame}
        onDeselectFrame={() => setSelectedFrameId(null)}
        onSubmit={handleSubmit}
        agentState={agentState}
        onOpenModal={openModal}
      />

      <AgentModal
        open={modalOpen}
        onClose={closeModal}
        conversation={conversation}
        agentState={agentState}
        traces={traces}
      />

    </div>
  )
}
