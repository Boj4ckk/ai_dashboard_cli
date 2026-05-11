from agents.db_agent.state import DbState
from core.ai_provider import AIProvider
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from agents.db_agent.node import SqlGeneratorNode
from mcp_servers.client import get_mcp_tools


def should_continue(state: DbState) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools_node"
    return END


async def build_db_graph(ai_provider: AIProvider):
    tools = await get_mcp_tools()

    builder = StateGraph(DbState)
    builder.add_node("sql_generator_node", SqlGeneratorNode(tools, ai_provider))
    builder.add_node("tools_node", ToolNode(tools))

    builder.add_edge(START, "sql_generator_node")
    builder.add_conditional_edges("sql_generator_node", should_continue)
    builder.add_edge("tools_node", "sql_generator_node")

    return builder.compile(
        checkpointer=None,
        interrupt_before=None,
        debug=True
    )
