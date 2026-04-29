import os

# Contenu du fichier Markdown pour Claude
content = """# Projet : AI Data Dashboard (Text-to-OLAP)

## Vision Macro
Ce projet est un Dashboard intelligent permettant à des utilisateurs en entreprise d'interagir avec des bases de données **OLAP** via un langage naturel. L'objectif est de transformer un prompt textuel en visualisations de données dynamiques et sécurisées.

## Architecture Globale
L'application repose sur un couplage fort entre un agent intelligent (Backend) et une interface de visualisation modulaire (Frontend).

### 1. Backend (FastAPI + FastMCP + LangGraph)
* **Rôle :** Intelligence métier et orchestration.
* **Flux :** Reçoit le prompt -> Utilise LangGraph pour planifier l'analyse -> Utilise des outils **FastMCP** pour requêter les bases OLAP -> Génère un graphique (Plotly/HTML).
* **Particularité :** Le backend ne renvoie pas juste des données, il renvoie des composants HTML complets (Server-Side Rendering de graphes) qu'il stocke temporairement.

### 2. Frontend (React + TypeScript + TanStack Query)
* **Rôle :** Interface utilisateur et affichage sécurisé.
* **Flux :** Envoie le prompt au backend -> Reçoit un `widget_id` -> Affiche le graphique via une **Iframe** pointant vers une route de rendu dédiée du backend.
* **Organisation :** Architecture orientée **Features (Usecases)** :
    * `chat` : Gestion de l'input et communication avec l'agent.
    * `widget` : Gestion de la grille de dashboard et de l'isolation des iframes.

## 🔄 Flux de Données Type (User Journey)
1. **Input :** L'utilisateur tape : *"Montre moi l'évolution du CA par région ce mois-ci"*.
2. **Action :** React (via TanStack Mutation) envoie le prompt au Backend.
3. **Génération :** Le Backend génère le HTML du graphe, le cache sous l'ID `chart_123` et répond `{ "widgetId": "chart_123" }`.
4. **Rendu :** React ajoute l'ID à sa liste de widgets. Une iframe `<iframe src="/render/chart_123">` est créée.
5. **Affichage :** L'iframe charge le HTML/JS de manière isolée sans impacter les performances ou la sécurité du Main Thread.

## 🛡️ Contraintes & Sécurité
* **Environnement :** Réseau d'entreprise (contraintes de proxy, SSL souvent strict, chemins Node spécifiques).
* **Isolation :** Utilisation systématique d'Iframes pour le contenu généré par IA (prévention XSS).
* **État :** Gestion d'état asynchrone centralisée par TanStack Query (pas de Redux).

## Stack Technique (Résumé)
* **Frontend :** React 18, TypeScript, Tailwind CSS, TanStack Query v5.
* **Backend :** Python 3.10+, FastAPI, LangGraph, FastMCP.
* **Visualisation :** Plotly / HTML brut généré côté serveur.
"""