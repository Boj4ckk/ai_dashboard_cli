import { useEffect, useRef } from 'react'
import type { AgentModalProps } from '../types/components'

export function AgentModal({ open, onClose, conversation, agentState, traces }: AgentModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const isThinking = agentState === 'thinking'

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [conversation, traces])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.15)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: 'min(720px, calc(100vw - 48px))',
          maxHeight: '70vh',
          borderRadius: 28,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(40px) saturate(200%) brightness(1.08)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.08)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)',
          border: '0.5px solid rgba(255,255,255,0.35)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06)',
          animation: 'modalIn 0.22s ease-out',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Specular highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 16, right: 16, height: 1,
            background: 'rgba(255,255,255,0.55)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 14px',
            borderBottom: '0.5px solid rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0D' }}>Agent thread</span>
            {isThinking && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#FF5721',
                  background: '#FFF0EB',
                  border: '1px solid #FFCAB8',
                  borderRadius: 999,
                  padding: '2px 8px',
                }}
              >
                <span style={{ animation: 'blink 1s step-start infinite', width: 6, height: 6, borderRadius: '50%', background: '#FF5721', display: 'inline-block' }} />
                Live
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.06)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#666677',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={bodyRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {conversation.length === 0 && traces.length === 0 && (
            <p style={{ fontSize: 13, color: '#9B9BA8', fontFamily: 'monospace', textAlign: 'center', margin: 'auto' }}>
              No activity yet. Submit a prompt to start.
            </p>
          )}

          {/* Conversation messages */}
          {conversation.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  ...(msg.role === 'user'
                    ? { background: '#0D0D0D', color: '#FFFFFF' }
                    : {
                        backdropFilter: 'blur(12px)',
                        background: 'rgba(255,255,255,0.6)',
                        border: '0.5px solid rgba(0,0,0,0.1)',
                        color: '#0D0D0D',
                      }
                  ),
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Tool traces */}
          {traces.length > 0 && (
            <div
              style={{
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                border: '0.5px solid rgba(0,0,0,0.07)',
              }}
            >
              <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#9B9BA8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tool traces
              </span>
              {traces.map((trace, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'monospace', color: '#0D0D0D' }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: trace.status === 'done' ? '#16A34A' : '#FF5721',
                      animation: trace.status === 'active' ? 'blink 0.8s step-start infinite' : undefined,
                    }}
                  >
                    {trace.status === 'done' ? '✓' : '·'}
                  </span>
                  <span style={{ color: '#FF5721', fontWeight: 600 }}>{trace.tool}</span>
                  <span style={{ color: '#CACAD0' }}>→</span>
                  <span style={{ color: '#666677' }}>{trace.detail}</span>
                  {trace.timing && (
                    <span style={{ marginLeft: 'auto', color: '#9B9BA8', fontSize: 11 }}>{trace.timing}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
