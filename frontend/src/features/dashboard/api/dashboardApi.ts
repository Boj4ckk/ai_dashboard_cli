import type { SubmitPromptPayload, SubmitPromptResponse } from '../types/api'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1'

export async function submitPrompt(payload: SubmitPromptPayload): Promise<SubmitPromptResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}