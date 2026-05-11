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