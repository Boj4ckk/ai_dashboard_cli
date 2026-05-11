# AI Dashboard — Architecture cible

> Version : 0.1 — Mai 2026  
> Scope : backend FastAPI + LangGraph + MCP + frontend React

---

## 1. Vision

L'application est une **plateforme de dashboards générée par des agents IA**.

Un utilisateur pose une question en langage naturel. Un agent spécialisé interprète la question, appelle les outils nécessaires via MCP, et retourne un ou plusieurs **Artifacts** (texte, graphique HTML, image, spec Vega-Lite…). Le frontend injecte ces artifacts dans une grille de renderers adaptés (iframes, img, markdown…).

**Propriété clé :** le frontend et le router backend ne connaissent pas les agents. Ils ne connaissent que le contrat `Artifact`.

---

## 2. Concepts fondamentaux

### 2.1 Artifact

Unité de rendu universelle retournée par tout agent.

```python
class Artifact(TypedDict):
    id: str           # uuid4
    type: str         # "text" | "html" | "image/png" | "vega-lite" | "image/svg"
    content: str      # texte brut, HTML, base64 (images), JSON stringifié (vega)
    title: str        # titre affiché dans la carte du dashboard
    metadata: dict    # données libres : reasoning, queries_used, agent_id, ...
```

### 2.2 SSE Event

Contrat de streaming entre backend et tout client HTTP.

```typescript
type SSEEvent =
  | { type: "step";     data: { step: string } }       // progression temps réel
  | { type: "artifact"; data: Artifact }                // artifact prêt à rendre
  | { type: "error";    data: { message: string } }     // erreur récupérable
  | { type: "done" }                                    // fin du stream
```

### 2.3 BaseAgent

Contrat minimal que tout agent doit implémenter.

```python
class BaseAgent(ABC):
    def __init__(self, ai_provider: AIProvider): ...

    @abstractmethod
    async def stream_response(self, prompt: str) -> AsyncGenerator[dict, None]:
        """Yields des SSEEvent dicts : {type, data}"""
        ...
```

### 2.4 Agent Registry

Mapping `agent_id → classe` — seul endroit à modifier pour enregistrer un agent.

```python
AGENT_REGISTRY: dict[str, type[BaseAgent]] = {
    "db":      SQlAgent,
    # "chart":   ChartAgent,
    # "finance": FinanceAgent,
}
```

---

## 3. Architecture backend

### 3.1 Structure des fichiers

```
backend/src/
├── agents/
│   ├── base.py                  # BaseAgent ABC
│   ├── registry.py              # AGENT_REGISTRY
│   └── db_agent/                # agent SQL (existant, adapté)
│       ├── agent.py             # SQlAgent(BaseAgent)
│       ├── graph.py             # LangGraph ReAct graph
│       ├── node.py              # SqlGeneratorNode (LLM + tools)
│       └── state.py             # DbState TypedDict
│
├── core/
│   ├── ai_provider.py           # AIProvider ABC (LLM abstraction)
│   ├── artifacts.py             # Artifact TypedDict + helpers
│   ├── streaming.py             # format_sse_event() helper
│   ├── provider_factory.py      # factory OpenAI / Mistral / Anthropic
│   └── providers/
│       └── open_ai_api_provider.py
│
├── features/
│   └── chat/
│       ├── router.py            # POST /{agent_id}/stream (générique)
│       └── models/dto.py        # PromptRequest
│
├── mcp_servers/
│   ├── client.py                # MultiServerMCPClient + get_mcp_tools()
│   ├── registry.py              # MCP server configs par agent_id
│   └── server.py                # config SSE transport
│
├── config/
│   └── settings.py              # Pydantic BaseSettings
│
└── prompts/
    └── db_agent_prompt.py       # system prompt SQL agent
```

### 3.2 Router générique

```python
# features/chat/router.py

@router.post("/{agent_id}/stream")
async def stream_agent(
    agent_id: str,
    request: PromptRequest,
    ai_provider: AIProvider = Depends(get_ai_provider),
):
    agent_class = AGENT_REGISTRY.get(agent_id)
    if not agent_class:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    agent = agent_class(ai_provider)

    async def event_generator():
        async for event in agent.stream_response(request.prompt):
            yield f"data: {json.dumps(event)}\n\n"
        yield 'data: {"type": "done"}\n\n'

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

**Résultat :** ajouter un agent = ajouter une entrée dans `AGENT_REGISTRY`. Le router ne change jamais.

### 3.3 Cycle de vie d'un agent — pattern ReAct (LangGraph)

```
START
  └─► [LLM Node]  ──── tool_calls? ────► [ToolNode] ─┐
           ▲                                           │
           └───────────────────────────────────────────┘
           │
      no tool_calls
           │
           └─► build Artifact(s) → yield {type:"artifact", data:...}
                    └─► END
```

Chaque nœud LLM peut émettre des `{type:"step"}` via `get_stream_writer()` pour donner de la visibilité temps réel au frontend (THINKING → QUERYING → DONE).

### 3.4 MCP — isolation par agent

Chaque agent charge les tools MCP dont il a besoin via `get_mcp_tools(agent_id)`. La config MCP est centralisée dans `mcp_servers/registry.py` :

```python
MCP_CONFIG: dict[str, list[dict]] = {
    "db": [
        {"transport": "sse", "url": settings.MCP_DB_URL}
    ],
    "chart": [
        {"transport": "sse", "url": settings.MCP_CHART_URL}
    ],
}
```

Un agent ne voit que ses propres tools MCP — pas de pollution entre agents.

---

## 4. Architecture frontend

### 4.1 Structure des fichiers

```
frontend/src/
├── features/
│   ├── chat/
│   │   ├── api/chatService.ts       # HTTP + SSE client
│   │   ├── hooks/useChat.ts         # logique chat + streaming
│   │   └── types/chatTypes.ts       # SSEEvent, ChunkData
│   │
│   └── artifacts/
│       ├── ArtifactRenderer.tsx     # routeur de rendu selon artifact.type
│       ├── types.ts                 # Artifact type TS
│       └── renderers/
│           ├── IframeRenderer.tsx   # artifact.type === "html"
│           ├── ImageRenderer.tsx    # artifact.type === "image/png" | "image/svg"
│           ├── VegaRenderer.tsx     # artifact.type === "vega-lite"
│           └── MarkdownRenderer.tsx # artifact.type === "text"
│
└── pages/
    └── home.tsx                     # chat panel + artifact grid
```

### 4.2 ArtifactRenderer — routeur de rendu

```tsx
// features/artifacts/ArtifactRenderer.tsx

const ArtifactRenderer = ({ artifact }: { artifact: Artifact }) => {
  switch (artifact.type) {
    case "html":       return <IframeRenderer content={artifact.content} title={artifact.title} />
    case "image/png":
    case "image/svg":  return <ImageRenderer src={artifact.content} title={artifact.title} />
    case "vega-lite":  return <VegaRenderer spec={JSON.parse(artifact.content)} title={artifact.title} />
    case "text":
    default:           return <MarkdownRenderer content={artifact.content} title={artifact.title} />
  }
}
```

**Résultat :** brancher un nouveau type de rendu = ajouter un `case` et un composant. Le reste de l'app ne change pas.

### 4.3 IframeRenderer — sandbox sécurisé

```tsx
// features/artifacts/renderers/IframeRenderer.tsx

const IframeRenderer = ({ content, title }: { content: string; title: string }) => {
  const blob = new Blob([content], { type: "text/html" })
  const url  = URL.createObjectURL(blob)

  return (
    <iframe
      src={url}
      title={title}
      sandbox="allow-scripts"          // pas d'accès parent, pas de navigation
      className="w-full h-full border-0 rounded"
    />
  )
}
```

Le HTML généré par le MCP est injecté dans un blob URL — isolé du DOM principal.

### 4.4 useChat — consommation du stream

```typescript
// features/chat/hooks/useChat.ts

const streamChat = async (prompt: string, agentId: string) => {
  setIsLoading(true)
  setStep("thinking")

  await chatService.streamPrompt(prompt, agentId, (event: SSEEvent) => {
    if (event.type === "step")     setStep(event.data.step)
    if (event.type === "artifact") setArtifacts(prev => [...prev, event.data])
    if (event.type === "error")    setError(event.data.message)
  })

  setIsLoading(false)
}
```

Les artifacts s'accumulent dans le state au fil du stream — le dashboard se construit progressivement.

---

## 5. Flow complet — requête utilisateur

```
┌─────────────────────────────────────────────────────────────┐
│  User                                                       │
│  "Combien de ventes en Q3 par région ?"                     │
└───────────────────────┬─────────────────────────────────────┘
                        │ POST /api/v1/chat/db/stream
                        │ { "prompt": "..." }
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Router  (générique)                                │
│  lookup AGENT_REGISTRY["db"] → SQlAgent                    │
│  StreamingResponse (text/event-stream)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  SQlAgent.stream_response()                                 │
│                                                             │
│  1. build_db_graph()  →  LangGraph ReAct graph             │
│  2. graph.astream(initial_state)                            │
│                                                             │
│  Yields:                                                    │
│    {type:"step",     data:{step:"thinking"}}      → SSE    │
│    {type:"step",     data:{step:"querying"}}       → SSE    │
│    {type:"artifact", data:{type:"text", ...}}      → SSE    │
│    {type:"done"}                                   → SSE    │
└───────────────────────┬─────────────────────────────────────┘
                        │  MCP tool calls
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  MCP Server  (SSE transport)                                │
│  - get_schema()                                             │
│  - get_distinct_values(table, col)                          │
│  - execute_sql(query)                                       │
└─────────────────────────────────────────────────────────────┘
                        │  SSE events
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend  (useChat hook)                                   │
│                                                             │
│  event "step"     → setStep("thinking")                    │
│  event "step"     → setStep("querying")                    │
│  event "artifact" → setArtifacts([...prev, artifact])      │
│  event "done"     → setIsLoading(false)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  ArtifactRenderer                                           │
│  artifact.type === "text"  →  <MarkdownRenderer />         │
│  artifact.type === "html"  →  <IframeRenderer />           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Ajouter un nouvel agent — checklist

Un agent = un MCP qui retourne des composants graphiques (HTML, image, vega…).

### Backend

```
backend/src/agents/my_agent/
├── agent.py     # MyAgent(BaseAgent) — implémente stream_response()
├── graph.py     # build_my_graph() — LangGraph graph
├── node.py      # MyGeneratorNode — LLM + tools + yield Artifacts
└── state.py     # MyState TypedDict
```

1. **`state.py`** — définir les champs spécifiques à l'agent (en plus des champs communs `user_prompt`, `messages`, `current_step`, `artifacts`)
2. **`node.py`** — nœud LLM qui construit un `Artifact` en sortie
3. **`graph.py`** — câbler le graph ReAct avec les tools MCP de l'agent
4. **`agent.py`** — hériter `BaseAgent`, wrapper `stream_response()` pour normaliser les events SSE
5. **`mcp_servers/registry.py`** — ajouter la config MCP de l'agent
6. **`agents/registry.py`** — une ligne : `"my_agent": MyAgent`

### Frontend

Uniquement si l'agent retourne un nouveau type d'artifact :

1. Créer `features/artifacts/renderers/MyRenderer.tsx`
2. Ajouter un `case "my-type"` dans `ArtifactRenderer.tsx`

---

## 7. Extension : Orchestrateur multi-agents

Pour des requêtes complexes nécessitant plusieurs agents en parallèle :

```
POST /api/v1/orchestrate/stream
{ "prompt": "Rapport complet Q3" }
```

L'orchestrateur décompose la question, appelle plusieurs agents en parallèle, et forward leurs artifacts dans un unique stream SSE. Le frontend reçoit un flux mixte d'artifacts — il les affiche au fur et à mesure sans savoir quelle agent les a produits.

```python
class OrchestratorAgent(BaseAgent):
    async def stream_response(self, prompt: str):
        sub_tasks = await self._plan(prompt)     # LLM décompose en sous-tâches

        async with asyncio.TaskGroup() as tg:
            for task in sub_tasks:
                tg.create_task(self._run_subagent(task))

        # forward les artifacts de chaque sub-agent au fur et à mesure
```

Cette couche est optionnelle — les agents spécialisés restent appelables directement.

---

## 8. Variables d'environnement requises

```env
# LLM Provider
OPENAI_API_KEY=...
OPENAI_BASE_URL=...
OPENAI_MODEL=...

# MCP Servers
MCP_DB_URL=http://localhost:3001/sse
# MCP_CHART_URL=http://localhost:3002/sse   # futur

# App
PORT=8443
```

---

## 9. Résumé des invariants

| Invariant | Raison |
|---|---|
| Tout agent hérite `BaseAgent` | Le router n'a pas à connaître les agents |
| Tout agent yield des `SSEEvent` normalisés | Le frontend est découplé des agents |
| Tout résultat est un `Artifact` typé | Le renderer frontend est générique |
| Le MCP config est dans `mcp_servers/registry.py` | Isoler la topologie réseau du code agent |
| `AGENT_REGISTRY` est la seule liste à maintenir | Ajouter un agent = 1 ligne, 0 PR sur le router |
