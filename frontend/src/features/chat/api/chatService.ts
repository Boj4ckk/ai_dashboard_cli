
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
export const chatService = {
    postPrompt: async (prompt: string) => {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        })

        if(!response.ok) {
            throw new Error('Failed to post prompt')
        }
       
        return response.json()},
    
   
}


