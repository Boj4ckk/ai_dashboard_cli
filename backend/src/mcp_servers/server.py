
from config.settings import settings


MCP_SERVERS = {

    "remote_server": {
         "transport": "sse",
         "url": settings.mcp_url,
     }
}