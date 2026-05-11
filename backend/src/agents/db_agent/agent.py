



from core.ai_provider import AIProvider
from agents.db_agent.state import DbState
from agents.db_agent.graph import build_db_graph
from langchain_core.messages import HumanMessage

class SQlAgent:
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider
    

    async def generate_response(self, prompt:str) -> dict:

        
        initale_state: DbState = {
            "user_prompt": prompt,
            "messages": [HumanMessage(content=prompt)],
            "sql_queries": []
        }

        graph = await build_db_graph(self.ai_provider)
        result = await graph.ainvoke(initale_state)
        return result
    
    async def stream_response(self,prompt:str ):
        initale_state: DbState = {
            "user_prompt": prompt,
            "messages": [HumanMessage(content=prompt)],
            "sql_queries": []
        }
        graph = await build_db_graph(self.ai_provider)
        async for chunk in graph.astream(initale_state,stream_mode=["updates", "custom"]):
            yield chunk
        

        