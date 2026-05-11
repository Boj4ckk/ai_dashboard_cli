import json
from agents.db_agent.state import CurrentStep, DbState
from core.ai_provider import AIProvider
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.tools import BaseTool
from prompts.db_agent_prompt import SQL_GENERATOR_PROMPT
from mcp_servers.client import get_db_schema
from langgraph.config import get_stream_writer

class SqlGeneratorNode:
    def __init__(self, tools: list[BaseTool], ai_provider: AIProvider):
        self.tools = tools
        self.ai_provider = ai_provider

    async def __call__(self, state: DbState) -> DbState:
        try:
            writer = get_stream_writer()
            writer({"current_step": CurrentStep.THINKING.value})



            llm_with_tools = self.ai_provider.llm.bind_tools(self.tools)
            messages = [SystemMessage(content=SQL_GENERATOR_PROMPT.format(schema=await get_db_schema()))] + state['messages']

            response = await llm_with_tools.ainvoke(messages)

            # ReAct: LLM called a tool → not done yet
            if response.tool_calls:
                return {
                    "messages": [response],
                    "current_step": CurrentStep.QUERYING.value,
                }

            # Final response: parse JSON to extract answer + reasoning
            try:
                parsed = json.loads(response.content)
                return {
                    "messages": [response],
                    "answer": parsed.get("answer", ""),
                    "reasoning": parsed.get("reasoning", ""),
                    "current_step": CurrentStep.DONE.value,
                }
            except json.JSONDecodeError:
                return {
                    "messages": [response],
                    "answer": response.content,
                    "reasoning": "",
                    "current_step": CurrentStep.DONE.value,
                }

        except Exception as e:
            print(f"error: {e}")
            return {
                "messages": [AIMessage(content=f"Error: {str(e)}")],
                "current_step": CurrentStep.ERROR,
            }

