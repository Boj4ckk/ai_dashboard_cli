



from typing import Annotated
from core.ai_provider import AIProvider
from langchain_protocol import TypedDict
from langgraph.graph.message import add_messages


class GlobalState(TypedDict):
    """Global state for the application."""
    # Add any global state variables here
    system_prompt:str
    user_prompt: str
    ai_provider: AIProvider
    messages: Annotated[list, add_messages]
    