import type { Message, ToolTrace } from './agent'

export interface SubmitPromptPayload {
  prompt: string
  frameId: string
  width: number
  height: number
}

export interface SubmitPromptResponse {
  url: string
  title?: string
  conversation?: Message[]
  traces?: ToolTrace[]
}
