import { useState, useEffect, useRef } from 'react'
import type { PromptBarProps } from '../types/components'

export function PromptBar({ selectedFrame, onDeselectFrame, onSubmit, agentState, onOpenModal }: PromptBarProps) {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const frameIndex = selectedFrame ? null : null
  const canSubmit = prompt.trim().length > 0 && selectedFrame !== null
  const isThinking = agentState === 'thinking'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
      }
      if (e.key === 'Escape') {
        if (document.activeElement === textareaRef.current) {
          textareaRef.current?.blur()
        } else {
          onDeselectFrame()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDeselectFrame])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSubmit && !isThinking) {
        onSubmit(prompt)
        setPrompt('')
      }
    }
  }

  function handleSubmitClick() {
    if (!canSubmit || isThinking) return
    onSubmit(prompt)
    setPrompt('')
  }

  return (
    <div
      className="fixed bottom-5 left-1/2 z-40 flex flex-col gap-0"
      style={{ transform: 'translateX(-50%)', width: 'min(680px, calc(100vw - 32px))' }}
    >
      <div
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'rgba(255,255,255,0.82)',
          border: selectedFrame ? '1.5px solid #FFCAB8' : '1px solid #E5E5E7',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.04)',
          transition: 'border-color 0.15s',
          overflow: 'hidden',
        }}
      >
        {/* ── Input row ── */}
        <div className="flex items-start gap-2 px-4 pt-3 pb-2">

          {/* Agent pill */}
          <button
            onClick={onOpenModal}
            className="shrink-0 mt-0.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-medium transition-all duration-150 select-none"
            style={
              isThinking
                ? { background: '#FFF0EB', color: '#FF5721', border: '1px solid #FFCAB8' }
                : { background: '#F7F7F8', color: '#9B9BA8', border: '1px solid #E5E5E7' }
            }
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isThinking ? '#FF5721' : '#CACAD0',
                display: 'inline-block',
                flexShrink: 0,
                animation: isThinking ? 'pulse 1.2s ease-in-out infinite' : undefined,
              }}
            />
            {isThinking ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SpinnerIcon />
                thinking
              </span>
            ) : 'agent'}
          </button>

          {/* Input area */}
          <div className="flex-1 flex flex-col gap-1">
            {/* Frame chip */}
            {selectedFrame && (
              <div
                className="self-start flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium"
                style={{ background: '#FFF0EB', color: '#FF5721', border: '1px solid #FFCAB8' }}
              >
                <span
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF5721', display: 'inline-block' }}
                />
                Frame selected
                <button
                  onClick={onDeselectFrame}
                  className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ lineHeight: 1, fontSize: 12 }}
                >
                  ×
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
              placeholder={selectedFrame ? 'Ask anything…' : 'Select a frame first…'}
              rows={1}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 14,
                lineHeight: 1.5,
                color: '#0D0D0D',
                width: '100%',
                minHeight: 28,
                maxHeight: 140,
                overflow: 'auto',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmitClick}
            disabled={!canSubmit || isThinking}
            className="shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95"
            style={
              canSubmit && !isThinking
                ? { background: '#FF5721', color: '#FFFFFF', cursor: 'pointer' }
                : { background: '#EFEFEF', color: '#CACAD0', cursor: 'default' }
            }
          >
            <SendIcon />
          </button>
        </div>

        {/* ── Hint bar ── */}
        <div
          className="px-4 pb-2.5 flex items-center gap-1"
          style={{ fontSize: 11, fontFamily: 'monospace', color: '#9B9BA8' }}
        >
          <span>⌘K focus</span>
          <Sep />
          <span>↵ send</span>
          <Sep />
          <span>⇧↵ newline</span>
          <Sep />
          <span>Esc deselect</span>
          <Sep />
          <span>powered by langgraph + fastmcp</span>
        </div>
      </div>
    </div>
  )
}

function Sep() {
  return <span style={{ color: '#E5E5E7', margin: '0 3px' }}>·</span>
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 7H12.5M12.5 7L7.5 2M12.5 7L7.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="16" strokeDashoffset="6" strokeLinecap="round" />
    </svg>
  )
}
