

from agents.state import GlobalState
from langchain_core.messages import AIMessage


async def generate_query_node(state:GlobalState) -> GlobalState:

    ai_provider = state.get('ai_provider')
    if not ai_provider:
        print('No ai provider')
        return state
    try:
        response = ai_provider.generate_structured(
            prompt=state['user_prompt'],
            system_prompt=state['system_prompt'],
            max_completion_tokens=10000
        )

        if response.error:
            print(f"Generation error: {response.error}")
            return state

        return {
            **state,
            "messages": [AIMessage(content=response.content)],
        }

    except Exception as e:
        print(f"error: {e}")
        return state
