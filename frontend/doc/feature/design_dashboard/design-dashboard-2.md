# Feature: Prompt to Frame — Session 2 Update
> État des lieux après session 2. Complète design-dashboard-1.md.

---

## Ce qui a été implémenté

### Fichiers créés / modifiés

| Fichier | Statut | Notes |
|---|---|---|
| `src/features/dashboard/types.ts` | ✅ Modifié | Ajout `ActiveTool`, `TopbarProps`, `FloatingToolbarProps`, `CanvasMoveEvent`, extension `CanvasHostProps` |
| `src/features/dashboard/components/Topbar.tsx` | ✅ Créé | Header 48px frosted glass, titre éditable, zoom controls, bouton tools, bouton poubelle |
| `src/features/dashboard/components/FloatingToolbar.tsx` | ✅ Créé | Palette horizontale draggable, outil iframe avec état actif orange |
| `src/features/dashboard/components/CanvasHost.tsx` | ✅ Modifié | Outil dessin iframe, drag de frame, résolution frame fantôme |
| `src/pages/dashboard.tsx` | ✅ Modifié | État `activeTool`, `toolbarOpen`, `title` levés, tous composants câblés |
| `index.html` | ✅ Modifié | Google Fonts : Geist, Geist Mono, Instrument Serif |

---

## Point 1 — `<Topbar />` — DONE

### Spec finale implémentée

- **Layout** : `fixed top-0 h-12 z-50`, frosted glass (`backdrop-filter: blur(20px) saturate(180%)`), `border-bottom: 0.5px solid #E5E5E7`
- **Gauche** : logo carré noir 18×18px + "P" mono, titre `<span contentEditable>` inline (`poc dashboard / {title}`)
- **Droite** : zoom `−` · `85%` · `+`, séparateur, bouton tools (icône clé), bouton poubelle
- **Bouton tools** : icône sobre, `--text-muted` au repos, `--text-primary` au hover, `--accent` quand toolbar ouverte. Tooltip "Tools" au hover (custom, pas `title` natif)
- **Bouton poubelle** : grisé (`#CACAD0`) si aucune frame sélectionnée, rouge (`#DC2626`) si frame sélectionnée. Tooltip "Delete frame" au hover uniquement quand actif

---

## Point 2 — `<FloatingToolbar />` — DONE

### Spec finale implémentée

- **Déclencheur** : bouton tools dans la topbar (droite), toggle visibilité
- **Position initiale** : sous le bouton toolbar (`rect.bottom + 8px`)
- **Shape** : palette horizontale, `border-radius: 12px`, liquid glass
- **Drag** : handle dédié à gauche (6 points `⠿`), drag libre sur l'écran via listeners natifs `window`
- **Outil iframe** : carré 40×40px, inactif = transparent, actif = `border: 1.5px solid --accent` + `--accent-subtle` bg. Tooltip "Create frame" au hover

---

## Point 3 — Outil dessin iframe dans `<CanvasHost />` — DONE

### Implémentation

- **Activation** : `activeTool === 'iframe'` → curseur `crosshair` sur tout le canvas
- **Dessin** : `mousedown` → origine en coordonnées canvas (corrigées pan + zoom), `mousemove` → preview rectangle dashed accent + fond `rgba(255,87,33,0.08)`, `mouseup` → création frame
- **4 directions** : drag vers n'importe quel coin, le rectangle s'adapte
- **Dimensions live** : pill orange `420 × 260` près du coin bas-droit pendant le drag
- **Taille min** : 200×150px — si trop petit au release, silent cancel (pas de frame créée)
- **Taille max** : 1600×1200px — clamp au drag
- **Coordonnées** : `screenToCanvas()` corrige `clientX/Y` avec `pan` et `zoom` courants via refs (pas de stale closure)
- **One-shot** : l'outil se désactive automatiquement après création (`onToolUsed`)
- **Frame créée** : non sélectionnée, `status: 'empty'`, `id: f${Date.now()}`

---

## Point 4 — Drag de frame — DONE

### Spec décidée en session

- Pas de handle dédié — le drag se déclenche directement sur la surface de la frame **si elle est déjà sélectionnée**
- Premier clic → sélectionne la frame
- Clic-glisse sur frame déjà sélectionnée → déplace la frame
- Curseur `grab` sur frame sélectionnée, `grabbing` pendant le drag
- Déplacement calculé en coordonnées canvas (`dx / zoom`, `dy / zoom`)
- `e.stopPropagation()` systématique sur `mousedown` de frame pour éviter la multi-sélection

### Bug fixé en session

- **Frame fantôme** : après suppression, `selectedFrameId` pouvait rester sur un ID inexistant → frame rendue comme "selected" indéfiniment. Fix : `resolvedSelectedId` dans `CanvasHost` filtre les IDs qui n'existent plus dans `frames[]`
- **Multi-sélection** : `stopPropagation` manquant dans la branche `isSelected` du `onMouseDown`
- **Delete** : `handleDeleteFrame` force `setSelectedFrameId(null)` inconditionnellement

---

## État levé dans `dashboard.tsx`

```ts
frames: FrameData[]
selectedFrameId: string | null
zoom: number                    // init 0.85
pan: { x, y }                  // init { x: 40, y: 20 }
title: string                   // init 'Q3 Sales'
toolbarOpen: boolean
activeTool: ActiveTool          // 'iframe' | null
```

---

## Ce qui reste à faire (spec design-dashboard-0)

| Point | Composant | Statut |
|---|---|---|
| 1 | Design Tokens `tokens.css` | ⏭️ Skippé — palette déjà dans `palette.ts` + tailwind.config.js |
| 2 | `<Topbar />` | ✅ Done |
| 3 | `<CanvasHost />` | ✅ Done |
| 4 | `<Frame />` (composant dédié avec resize handles, states, iframe) | ⏳ À faire |
| 5 | `<PromptBar />` (remplace textarea actuelle) | ⏳ À faire |
| 6 | `<AgentModal />` | ⏳ À faire |
| 7 | `dashboardApi.ts` — `submitPrompt()` | ⏳ À faire |
| 8 | Assemblage final `dashboard.tsx` | 🔄 En cours |

---

## Décisions prises en session

- Toolbar flottante **horizontale** (pas verticale), draggable via handle 6 points à gauche
- Bouton toolbar dans la **topbar à droite** (pas à gauche), sobre, icône seule sans label
- Drag de frame : **pas de handle dédié** — clic-glisse direct sur la surface si frame déjà sélectionnée
- `tokens.css` skipé — les tokens sont déjà dans `palette.ts` et `tailwind.config.js`, pas de duplication
- Frame nouvellement créée : **non sélectionnée** (one-shot tool)
- Suppression : force `selectedFrameId = null` inconditionnellement pour éviter frame fantôme
