import { useChat } from '../features/chat/hooks/useChat'
import { usePreview } from '../features/chat/hooks/usePreview'
import { useEffect, useRef, useState } from 'react'

export function HomePage() {
  const { prompt, setPrompt,submit,handleKeyDown, isPending} = useChat()
  const { htmlContent } = usePreview()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeSize, setIframeSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.height && e.data?.width) {
        setIframeSize({ width: e.data.width, height: e.data.height })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-bg-base px-4 pb-10">

      {htmlContent && (
        <div className="w-full max-w-3xl mx-auto mb-6">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            sandbox="allow-scripts"
            className="border-0 rounded-2xl shadow-sm"
            title="Preview"
            style={{
              width: iframeSize ? `${iframeSize.width}px` : '100%',
              height: iframeSize ? `${iframeSize.height}px` : '384px',
              maxWidth: '100%',
            }}
          />
        </div>
      )}

      <div className="flex-1" />


      {/* Chat input */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-bg-base border border-border-default hover:border-border-strong focus-within:border-border-strong rounded-2xl px-5 py-4 shadow-sm transition-colors duration-150">

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            placeholder="Ask something about your data…"
            maxLength={2000}
            rows={3}
            className="w-full bg-transparent text-text-primary placeholder-text-muted resize-none focus:outline-none text-sm sm:text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '72px', maxHeight: '200px' }}
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">

            <span className="text-xs text-text-muted">
              {prompt.length > 0 ? `${prompt.length} / 2000` : 'Enter to send'}
            </span>

            <button
              onClick={submit}
              disabled={isPending || !prompt.trim()}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${isPending || !prompt.trim()
                  ? 'bg-bg-muted text-text-muted cursor-not-allowed'
                  : 'bg-accent text-text-inverted hover:bg-accent-hover active:scale-95'
                }
              `}
            >
              {isPending ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <span>Send</span>
         
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
