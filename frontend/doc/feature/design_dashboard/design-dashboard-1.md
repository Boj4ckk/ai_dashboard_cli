# Feature: Prompt to Frame — Session 1 Update
> État des lieux après session 1. Complète design-dashboard-0.md.

---

## Ce qui a été implémenté

### Fichiers créés / modifiés

| Fichier | Statut | Notes |
|---|---|---|
| `src/pages/dashboard.tsx` | ✅ Créé | Renommé depuis `home.tsx`, base conservée |
| `src/router.tsx` | ✅ Modifié | `HomePage` → `DashboardPage` |
| `src/features/dashboard/types.ts` | ✅ Créé | Tous les types de la feature |
| `src/features/dashboard/components/CanvasHost.tsx` | ✅ Créé | Canvas pannable/zoomable |
| `src/pages/home.tsx` | 🗑️ Supprimé | Remplacé par dashboard.tsx |

---

## Point 3 — `<CanvasHost />` — DONE

### Implémentation

**Layout** : Le root de `dashboard.tsx` est `relative h-screen overflow-hidden`. Le canvas occupe `absolute inset-0`. Le chat flotte en `absolute bottom-0 z-10` — les frames ne passent jamais derrière.

**Dot-grid** : appliqué sur le conteneur outer fixe (`absolute inset-0`), pas sur le div interne transformé. Ça garantit que le fond couvre tout l'écran quelle que soit la position du pan.

**Wheel events** : listener natif non-passif via `useEffect` + `addEventListener('wheel', ..., { passive: false })` sur le `containerRef`. Raison : React `onWheel` est passif et ne peut pas appeler `preventDefault()`, ce qui laissait le browser zoomer la page entière (textbox incluse). Le listener natif est scopé au canvas uniquement.

**Pan bidirectionnel** : utilise `e.deltaX` et `e.deltaY` — scroll deux doigts fonctionne horizontalement et verticalement.

**Refs pour pan/zoom** : `panRef` et `zoomRef` sont synchronisés à chaque render pour que le listener natif (closure stale) lise toujours les valeurs courantes sans être re-attaché.

### Interactions implémentées

| Input | Action | Statut |
|---|---|---|
| Alt + drag | Pan | ✅ |
| Middle-button drag | Pan | ✅ |
| Scroll deux doigts (X+Y) | Pan | ✅ |
| Ctrl/Cmd + Scroll | Zoom (step 0.05, clamp 0.25–2.0) | ✅ |
| Click sur fond | Deselect frame | ✅ |

### Props

Conformes à la spec. `onResizeFrame` et `onClearFrame` sont passées mais non consommées en interne (utilisées par `<Frame />`, point 4).

---

## Types — `features/dashboard/types.ts`

Tous les types de la feature sont centralisés ici, conformément à l'archi feature-driven :

```ts
FrameStatus         // 'empty' | 'loading' | 'locked'
FrameData           // id, x, y, width, height, status, iframeUrl?, title?
CanvasHostProps     // props du composant CanvasHost
Message             // role, content
ToolTrace           // tool, detail, timing?, status
```

> Règle respectée : aucune interface inline dans les composants.

---

## `dashboard.tsx` — état levé

État présent :
```ts
frames: FrameData[]          // 3 frames initiales pré-positionnées
selectedFrameId: string | null
zoom: number                 // init 0.85
pan: { x, y }               // init { x: 40, y: 20 }
```

État manquant (à ajouter aux prochaines sessions) :
```ts
agentState: 'idle' | 'thinking' | 'done'
modalOpen: boolean
conversation: Message[]
traces: ToolTrace[]
title: string
```

Chat existant (`useChat`) conservé en parallèle — textarea temporaire en bas, sera remplacé par `<PromptBar />` (point 5).

---

## Ce qui reste à faire (spec design-dashboard-0)

| Point | Composant | Statut |
|---|---|---|
| 1 | Design Tokens `tokens.css` | ⏳ À faire |
| 2 | `<Topbar />` | ⏳ À faire |
| 3 | `<CanvasHost />` | ✅ Done |
| 4 | `<Frame />` (avec resize handles, states, iframe) | ⏳ À faire |
| 5 | `<PromptBar />` (remplace textarea actuelle) | ⏳ À faire |
| 6 | `<AgentModal />` | ⏳ À faire |
| 7 | `dashboardApi.ts` — `submitPrompt()` | ⏳ À faire |
| 8 | Assemblage final `dashboard.tsx` | 🔄 En cours |

---

## Décisions prises en session

- `home.tsx` renommé `dashboard.tsx` pour cohérence, même base de code.
- `<Frame />` : placeholder div dans `CanvasHost` pour l'instant — sera extrait en composant dédié au point 4.
- Chat `useChat` temporairement conservé dans `dashboard.tsx` pendant la migration vers `<PromptBar />`.
- Fond dot-grid sur le conteneur fixe (pas sur le canvas transformé) pour éviter le bord blanc au pan.
