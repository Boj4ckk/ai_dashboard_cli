import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { chatService } from "../api/chatService"




export const usePreview = () => {
    const [preview, setPreview] = useState('')
    const {data:htmlContent} = useQuery({
        queryKey: ['preview'],
        queryFn: () => chatService.getPreview()})

    
    return {preview, setPreview, htmlContent}
}