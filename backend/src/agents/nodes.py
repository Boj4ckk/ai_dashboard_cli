from agents.state import GlobalState
from langchain_core.messages import HumanMessage, SystemMessage


async def generate_query_node(state: GlobalState) -> GlobalState:
    ai_provider = state.get('ai_provider')
    if not ai_provider:
        print('No ai provider')
        return state
    try:
        messages = []
        if state.get('system_prompt'):
            messages.append(SystemMessage(content=state['system_prompt']))
        messages.append(HumanMessage(content=state['user_prompt']))

        response = await ai_provider.llm.ainvoke(messages)

        return {
            **state,
            "messages": [response],
        }

    except Exception as e:
        print(f"error: {e}")
        return state
