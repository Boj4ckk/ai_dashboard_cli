
from langchain_mcp_adapters.client import MultiServerMCPClient
from mcp_servers.server import MCP_SERVERS

async def get_mcp_tools():
    client = MultiServerMCPClient(MCP_SERVERS)
    return await client.get_tools()


async def get_db_schema() -> str:
    tools = await get_mcp_tools()

    schema_tool = next((t for t in tools if t.name == "get_schema"), None)
    if not schema_tool:
        return "get schema tool not found"
    result = await  schema_tool.ainvoke({})
    return result