import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { submitPrompt } from '../api/dashboardApi'
import type { FrameData } from '../types/frame'
import type { Message, ToolTrace } from '../types/agent'

type AgentState = 'idle' | 'thinking' | 'done'

const INITIAL_FRAMES: FrameData[] = [
  { id: 'f1', x: 80,  y: 60,  width: 420, height: 260, status: 'empty' },
  { id: 'f2', x: 540, y: 60,  width: 360, height: 260, status: 'empty' },
  { id: 'f3', x: 80,  y: 360, width: 360, height: 240, status: 'empty' },
]

export function useDashboard() {
  const [frames, setFrames] = useState<FrameData[]>(INITIAL_FRAMES)
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [conversation, setConversation] = useState<Message[]>([])
  const [traces, setTraces] = useState<ToolTrace[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: submitPrompt,
    onSuccess(res, variables) {
      setFrames(prev => prev.map(f =>
        f.id === variables.frameId
          ? { ...f, status: 'locked', iframeUrl: res.url, title: res.title ?? f.title }
          : f
      ))
      if (res.conversation) setConversation(res.conversation)
      if (res.traces) setTraces(res.traces)
      else setTraces(prev => prev.map(t => ({ ...t, status: 'done' as const })))
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: res.title ? `Frame "${res.title}" generated.` : 'Frame generated.' },
      ])
      setAgentState('done')
    },
    onError(_err, variables) {
      setFrames(prev => prev.map(f =>
        f.id === variables.frameId ? { ...f, status: 'empty' } : f
      ))
      setTraces([{ tool: 'error', detail: 'Request failed', status: 'done' }])
      setAgentState('idle')
    },
  })

  const handleSubmit = useCallback((prompt: string) => {
    const frame = frames.find(f => f.id === selectedFrameId)
    if (!frame || !prompt.trim()) return

    setConversation(prev => [...prev, { role: 'user', content: prompt }])
    setTraces([{ tool: 'agent', detail: 'Starting…', status: 'active' }])
    setAgentState('thinking')
    setFrames(prev => prev.map(f => f.id === frame.id ? { ...f, status: 'loading' } : f))

    mutation.mutate({
      prompt,
      frameId: frame.id,
      width: Math.round(frame.width),
      height: Math.round(frame.height),
    })
  }, [frames, selectedFrameId, mutation])

  const handleAddFrame = useCallback((frame: FrameData) => {
    setFrames(prev => [...prev, frame])
  }, [])

  const handleDeleteFrame = useCallback((id: string) => {
    console.log(frames)
    setFrames(prev => prev.filter(f => f.id !== id))
    setSelectedFrameId(null)
  }, [])

  const handleClearFrame = useCallback((id: string) => {
    setFrames(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'empty', iframeUrl: undefined, title: undefined } : f
    ))
  }, [])

  const handleMoveFrame = useCallback((id: string, x: number, y: number) => {
    setFrames(prev => prev.map(f => f.id === id ? { ...f, x, y } : f))
  }, [])

  const handleResizeFrame = useCallback((id: string, w: number, h: number) => {
    setFrames(prev => prev.map(f => f.id === id ? { ...f, width: w, height: h } : f))
  }, [])

  const selectedFrame = frames.find(f => f.id === selectedFrameId) ?? null

  return {
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
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
  }
}