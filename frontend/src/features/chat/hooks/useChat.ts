import { useState } from 'react'
import { chatService } from '../api/chatService'
import { useMutation } from '@tanstack/react-query'

export const useChat = () => {
  const [prompt, setPrompt] = useState('')


  const { mutate, isPending, error, data } = useMutation({
    mutationFn: (text: string) => chatService.postPrompt(text),
  })

  const submit = () => {
    if (!prompt.trim()) return
    mutate(prompt)
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return { prompt, setPrompt, isPending, error, data, submit, handleKeyDown }
}