# Feature: Prompt to Frame — Session 3 Update
> État des lieux après session 3. Complète design-dashboard-2.md.

---

## Ce qui a été implémenté

### Fichiers créés / modifiés

| Fichier | Statut | Notes |
|---|---|---|
| `src/features/dashboard/types/frame.ts` | ✅ Créé | `FrameStatus`, `ActiveTool`, `FrameData` |
| `src/features/dashboard/types/agent.ts` | ✅ Créé | `Message`, `ToolTrace` |
| `src/features/dashboard/types/api.ts` | ✅ Créé | `SubmitPromptPayload`, `SubmitPromptResponse` |
| `src/features/dashboard/types/components.ts` | ✅ Créé | Tous les types de props de composants |
| `src/features/dashboard/types/index.ts` | ✅ Créé | Re-export de tous les types |
| `src/features/dashboard/api/dashboardApi.ts` | ✅ Créé | `submitPrompt()` via `fetch` POST `/chat` |
| `src/features/dashboard/hooks/useDashboard.ts` | ✅ Créé | `useMutation` React Query, agentState, conversation, traces |
| `src/features/dashboard/components/Frame.tsx` | ✅ Créé | Composant frame complet |
| `src/features/dashboard/components/PromptBar.tsx` | ✅ Créé | Barre prompt bottom-center |
| `src/features/dashboard/components/AgentModal.tsx` | ✅ Créé | Modal liquid glass |
| `src/features/dashboard/components/CanvasHost.tsx` | ✅ Modifié | Rend `<Frame />`, destructure `onResizeFrame` + `onClearFrame` |
| `src/features/dashboard/components/Topbar.tsx` | ✅ Modifié | Import `types/components` |
| `src/features/dashboard/components/FloatingToolbar.tsx` | ✅ Modifié | Import `types/components` |
| `src/pages/dashboard.tsx` | ✅ Modifié | Câblage complet, suppression ancien chat textarea |

---

## Point 1 — Réorganisation des types

### Décision prise en session

L'ancien `types.ts` monolithique a été remplacé par un dossier `types/` avec 4 fichiers catégorisés :

```
types/
├── frame.ts       ← FrameStatus, ActiveTool, FrameData
├── agent.ts       ← Message, ToolTrace
├── api.ts         ← SubmitPromptPayload, SubmitPromptResponse
├── components.ts  ← tous les types de props (CanvasHostProps, FrameProps, TopbarProps, ...)
└── index.ts       ← re-export tout
```

L'ancien `types.ts` à la racine du feature est à supprimer (les composants importent maintenant depuis `types/components` ou `types/frame` directement).

---

## Point 2 — `dashboardApi.ts` — DONE

- `submitPrompt(payload)` : POST `${VITE_API_URL}/chat`
- Lève une `Error` si `!res.ok`
- Retourne `SubmitPromptResponse` : `{ url, title?, conversation?, traces? }`

---

## Point 3 — `useDashboard` hook — DONE

- Utilise `useMutation` de `@tanstack/react-query` (v5, déjà installé)
- Reçoit `frames`, `setFrames`, `selectedFrameId` en paramètres
- Gère : `agentState` (`idle` | `thinking` | `done`), `conversation: Message[]`, `traces: ToolTrace[]`, `modalOpen: boolean`
- `handleSubmit(prompt)` : set frame → `loading`, appelle `mutation.mutate()`
- `onSuccess` : frame → `locked`, peuple `iframeUrl` + `title`
- `onError` : frame → `empty`, trace d'erreur
- Expose `openModal` / `closeModal`

---

## Point 4 — `<Frame />` — DONE

### États visuels

| État | Bordure | Fond |
|---|---|---|
| `empty` | `2px dashed #CACAD0` | `#F7F7F8` |
| `empty + selected` | `2px dashed #FF5721` | `#FFF0EB` |
| `loading` | `2px solid #E5E5E7` | shimmer CSS animé |
| `locked` | `2px solid #E5E5E7` | `#FFFFFF` |
| `locked + selected` | `2px solid #FF5721` | `#FFFFFF` + `box-shadow: 0 0 0 3px #FFCAB8` |

### Tag pill
- `TARGETED` quand `empty + selected`
- `FRAME {n}` quand `locked + selected`
- Positionnement : `top: -26px, left: 0`, fond `#FF5721`, texte blanc mono 10px uppercase

### Resize handles
- Visibles uniquement : `empty + selected`
- 8 directions (corners + edges), carré `8×8px`, fond `#FF5721`
- Drag via listeners `window` `mousemove`/`mouseup`
- Min: 200×150px

### Close button
- Visible uniquement : `locked + hover`
- Cercle `22×22px`, fond `rgba(13,13,13,0.7)`, top-right de la frame
- `onClick` → `onClear()`

### iframe
- Rendu quand `status === 'locked'` et `frame.iframeUrl` défini
- `sandbox="allow-scripts"`, 100%×100%, pas de border

---

## Point 5 — `<PromptBar />` — DONE

- Fixed bottom-center, `width: min(680px, calc(100vw - 32px))`
- Frosted glass, `border-radius: 16px`
- Border `#FFCAB8` si frame sélectionnée, `#E5E5E7` sinon
- **Agent pill** gauche : `idle` = gris sobre, `thinking` = accent orange + spinner + animation pulse
- **Frame chip** : pill orange `● Frame selected ×` visible si `selectedFrame !== null`
- **Send button** : orange si `canSubmit && !thinking`, grisé sinon
- **Hint bar** bas : `⌘K focus · ↵ send · ⇧↵ newline · Esc deselect · powered by langgraph + fastmcp`
- Keyboard shortcuts : `Cmd/Ctrl+K` → focus, `Enter` → submit, `Shift+Enter` → newline, `Escape` → deselect

---

## Point 6 — `<AgentModal />` — DONE

- Overlay `rgba(0,0,0,0.15)`, click outside → close, `Escape` → close
- Modal liquid glass : `border-radius: 28px`, `backdrop-filter: blur(40px) saturate(200%) brightness(1.08)`
- Entrée : `animation: modalIn` (scale 0.96→1 + opacity 0→1, 220ms ease-out)
- Header : titre "Agent thread" + badge `● Live` (orange, clignotant) quand `thinking`
- Body scrollable, auto-scroll bas sur nouveau contenu
- Messages : user (bulle sombre) / assistant (bulle frosted)
- Tool traces : liste `✓ tool → detail timing`, step actif = `·` clignotant orange

---

## Point 7 — Intégration `CanvasHost`

`CanvasHost` rend maintenant `<Frame />` en lieu et place des divs inline. La prop `renderFrame` (render prop) a été abandonnée au profit d'un import direct — `CanvasHost` est le seul orchestrateur du drag, sélection et création de frame, donc il possède la logique et rend le composant lui-même.

---

## Ce qui reste à faire

| Point | Composant | Statut |
|---|---|---|
| Supprimer l'ancien `types.ts` à la racine du feature | — | ⏳ À faire |
| Ajouter les keyframes CSS (`shimmer`, `modalIn`, `fadeIn`, `blink`, `pulse`, `spin`) | `index.css` ou `tokens.css` | ⏳ À faire |
| Vérifier que `QueryClientProvider` est en place dans `main.tsx` | `main.tsx` | ⏳ À vérifier |
| Connecter le vrai endpoint backend (réponse `{ url }`) | backend | ⏳ Phase 2 |
| SSE streaming traces | backend + `dashboardApi.ts` | ⏳ Phase 2 |

---

## Décisions prises en session

- Types organisés par **domaine** (`frame`, `agent`, `api`, `components`) et non par feature — plus navigable et évite les imports circulaires
- `useDashboard` reçoit `setFrames` en paramètre plutôt que de posséder le state — la page reste la source de vérité unique pour `frames`
- `CanvasHost` rend `<Frame />` directement (pas de render prop) — il possède la logique drag/select, autant qu'il possède le rendu
- L'ancien textarea chat (`useChat`) est retiré — remplacé par `<PromptBar />` + `useDashboard`
