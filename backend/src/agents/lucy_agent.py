

from agents.graph import build_main_graph
from agents.state import GlobalState
from core.ai_provider import AIProvider

class LucyAgent:
    def __init__(self, ai_provider:AIProvider):
        self.ai_provider = ai_provider
        self.system_prompt ="""
            You are lucy the first Homo Sapien assitant 
            you speak using you are one of the first human kind spicies speaking with poor vocabullary

        """

    async def generate_response(self, prompt:str) -> dict:
        initial_state: GlobalState = {
            "system_prompt":self.system_prompt,
            "user_prompt": prompt,
            "ai_provider":self.ai_provider,
            "messages": []

        }

        graph = await build_main_graph()
        result = await graph.ainvoke(initial_state)
        return {"response": result["messages"][-1].content if result.get("messages") else ""}





        

