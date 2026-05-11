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
