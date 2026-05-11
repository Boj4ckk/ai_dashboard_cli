

from enum import Enum
import operator
from typing import Annotated

from langchain_protocol import TypedDict
from langgraph.graph import add_messages


class CurrentStep(Enum):
    THINKING = "thinking"
    QUERYING = "querying"
    DONE = "done"
    ERROR = "error"


class DbState(TypedDict):
    """Db state for the db agent"""
    user_prompt:str
    sql_queries: Annotated[list,operator.add]
    messages: Annotated[list, add_messages]
    answer: str
    reasoning: str
    current_step: CurrentStep