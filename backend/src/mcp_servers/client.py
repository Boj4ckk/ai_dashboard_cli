
from langchain_mcp_adapters.client import MultiServerMCPClient
from mcp_servers.server import MCP_SERVERS

async def get_mcp_tools():
    client = MultiServerMCPClient(MCP_SERVERS)
    return await client.get_tools()