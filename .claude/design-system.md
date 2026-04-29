# Design System — AI Dashboard Frontend

Style de référence : **Mistral Chat (white/light mode)**

---

## Palette de couleurs

| Token Tailwind         | Hex       | Usage                                 |
|------------------------|-----------|---------------------------------------|
| `bg-base`              | `#FFFFFF`  | Fond de page                          |
| `bg-subtle`            | `#F7F7F8`  | Sidebar, panneaux secondaires         |
| `bg-muted`             | `#EFEFEF`  | Hover sur surfaces                    |
| `bg-overlay`           | `#E8E8EA`  | Cards, dividers sur fond subtle       |
| `border-default`       | `#E5E5E7`  | Bordures standards                    |
| `border-strong`        | `#CACAD0`  | Bordures focus / actives              |
| `border-subtle`        | `#F0F0F2`  | Séparateurs légers                    |
| `text-primary`         | `#0D0D0D`  | Titres, contenu principal             |
| `text-secondary`       | `#666677`  | Labels, métadonnées                   |
| `text-muted`           | `#9B9BA8`  | Placeholders, désactivé               |
| `text-inverted`        | `#FFFFFF`  | Texte sur fond sombre                 |
| `accent` / `accent-DEFAULT` | `#FF5721` | CTA primaire, liens (orange Mistral) |
| `accent-hover`         | `#E84D1C`  | Hover de l'accent                     |
| `accent-subtle`        | `#FFF0EB`  | Fond de chips / badges                |
| `accent-muted`         | `#FFCAB8`  | Bordure accent, ring                  |

## Fichiers sources

- **Tokens TS** : `frontend/src/styles/palette.ts`
- **Config Tailwind** : `frontend/tailwind.config.js`

## Règles d'usage

- Toujours utiliser les tokens Tailwind ou importer depuis `palette.ts`
- Ne jamais mettre de hex brut dans les composants
- Fond de page = `bg-base`, jamais `white` ou `#fff` direct
- Accent = orange Mistral `#FF5721`, ne pas remplacer par du violet ou du bleu
