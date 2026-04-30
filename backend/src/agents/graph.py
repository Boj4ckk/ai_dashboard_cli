


from agents.state import GlobalState
from core.ai_provider import AIProvider
from langgraph.graph import END, START, StateGraph
from agents.nodes import generate_query_node
from mcp_servers.client import get_mcp_tools

async def build_main_graph():

    builder = StateGraph(GlobalState)
    builder.add_node("generate_node",generate_query_node)

    builder.add_edge(START,"generate_node")
    builder.add_edge("generate_node",END)

    tool = await get_mcp_tools()
    print(tool)

    print("Main graph generated")

    return builder.compile()

