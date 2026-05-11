import { useState } from 'react'
import { chatService } from '../api/chatService'
import { useMutation } from '@tanstack/react-query'

export const useChat = () => {
  const [prompt, setPrompt] = useState('')
  const [step, setStep] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setIsLoading] = useState(false)


  const { mutate, isPending, error, data } = useMutation({
    mutationFn: (text: string) => chatService.postPrompt(text),
  })

  const submit = () => {
    if (!prompt.trim()) return
    streamChat(prompt)
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const streamChat = async (prompt:string) => {
    setIsLoading(true)
    await chatService.streamPrompt(prompt, (data) => {
      if (data.current_step) setStep(data.current_step)
        if(data.answer) setAnswer(data.answer)

    })
    setIsLoading(false)
  }

  return { prompt, setPrompt, isPending, error, data, submit, handleKeyDown, step, answer, loading, streamChat }
}