# SPC Intellect

PROMPT : DEVELOPPEMENT DE LA PLATEFORME "SPC INTELLIGENCE" (`ai.stafprint.com`)
Tu es un développeur Full-Stack Senior & Prompt Engineer Expert React / TypeScript / Tailwind CSS / Framer Motion / TanStack Router.

Tu dois concevoir et développer une application web de chat IA ultra-moderne appelée SPC Intelligence (`ai.stafprint.com`). Elle sert d'assistant virtuel intelligent connecté à tout l'écosystème STAF PRINT CENTER (basé sur la cartographie de [https://stafprint.com/tools/ecosystem](https://stafprint.com/tools/ecosystem)).
---
🎨 1. DESIGN SYSTEM & CHARTE GRAPHIQUE
- Palette STAF PRINT : - Background : Slate très sombre (`#0f172a` / `#020617`) ou Off-white chaud (`#fdfbf7`).
  - Accents : Orange Ambre signature (`#f97316`) pour les boutons, le logo et les bordures actives.
- Layout Chat SaaS Moderne :
  - Sidebar gauche rétractable pour la gestion des conversations et l'accès au profil.
  - Zone centrale de discussion avec rendu Markdown riche (code, tableaux, liens dynamiques vers l'écosystème).
---

🔐 2. AUTHENTIFICATION & PAGE DE CONNEXION (`/login`)
L'application comporte une page de connexion dédiée accessible sur la route `/login`.

A. Interface de la Page `/login`
- Système d'Onglets (Tabs) : Permet d'effectuer la connexion selon l'espace visé :
  - `Espace Client`
  - `Espace Apprenant`
  - `Espace Formateur`
  - `Espace Administrateur` (Masqué ou accessible via raccourci `Ctrl+Shift+A`).
- Formulaire de Connexion : Saisie de l'Email et du Mot de passe.
- Mode Simulation (Client-Side) : - Aucun backend réel requis pour l'instant. Lors de la validation du formulaire, l'utilisateur est authentifié avec le rôle correspondant à l'onglet sélectionné.
  - La session est enregistrée dans le `localStorage` avec les données du compte factice (Nom, Email, Rôle, Espace).

B. Gestion des Espaces & Quotas
1. Visiteur Anonyme (Espace Public) :
   - Accès sans passer par `/login`.
   - Quota strict : 3 messages par jour maximum (géré via `localStorage`, compteur `X/3 messages restants`).
   - Discussion en texte brut uniquement (pas d'upload de document/image, pas de génération).
   - Tentative d'upload ou dépassement de quota ➔ Modale redirigeant vers `/login`.

2. Utilisateur Connecté (Espace Profil) :
   - L'en-tête et le profil affichent dynamiquement le nom de l'espace actif : `Espace Client`, `Espace Apprenant`, `Espace Formateur`, ou `Espace Administrateur`.
   - Messages illimités.
   - Upload & Analyse de fichiers (Images, PDF, documents textuels).
   - Génération de documents et visuels.

---
🤖 3. CONFIGURATION API GEMINI 2.5 FLASH & ROTATION DE CLÉS

- Pas de saisie manuelle de clé API par l'utilisateur. Les clés sont configurées directement dans le code via le fichier `.env` ou une constante système.
- Système de Rotation Automatique de Clés (Load-Balancing / Failover) :
  Implémenter un pool de 3 clés API qui s'alternent automatiquement pour répartir les quotas et pallier les limites de taux (Rate Limit) :
  1. `@secret:GOOGLE_API_KEY `
  2. `AQ.Ab8RN6KQ5zJxaX6oTDaEitiRjuIwPySHVnPA4MNgwC-P1dJxIws`
  3. `AQ.Ab8RN6IGhsVW6jUV4muHxynnvafPXLVqJEySnRIL0UyyW7gKpA`
- Utilisation du Modèle : `gemini-2.5-flash` (avec bascule automatique vers le moteur de simulation de fallback si toutes les clés échouent ou sont épuisées).

---
🗂️ 4. SIDEBAR & GESTION AVANCÉE DES CONVERSATIONS
- Isolation par Compte : - Chaque conversation est liée à l'ID du compte connecté.
  - À la déconnexion, l'historique de l'utilisateur masqué/protégé n'est plus visible. Seules les conversations publiques anonymes apparaissent pour les visiteurs.
- Fonctionnalités des Conversations dans la Sidebar :
  - Titre Automatique : Généré automatiquement à partir du premier message envoyé.
  - Renommer : Option dans le menu contextuel de la conversation pour modifier son titre.
  - Supprimer : Suppression définitive d'un fil de discussion.
  - Épingler : Possibilité d'épingler jusqu'à 3 conversations maximum en haut de la liste (réservé aux utilisateurs connectés).
- Panneau "Détails de la Conversation" :
  - Un volet latéral ou une modale inspectant la conversation active et affichant :
    - Nombre total de messages (envoyés vs reçus).
    - Nombre et liste des fichiers échangés (images/documents téléversés ou générés).
    - Date et heure de création de la discussion.

---

🛠️ 5. CAPACITÉS MULTIMODALES & SIMULATION DE FICHIERS

- Upload & Analyse (Mode Profil connecté) : Zone de Drag & Drop pour fichiers (`.png`, `.jpg`, `.pdf`, `.txt`).
- Génération d'Images & Documents :
  - Demande d'image ➔ L'IA génère et affiche une carte visuelle avec prévisualisation.
  - Demande de document ➔ L'IA génère un bloc structuré téléchargeable (`.md`, `.pdf`).

---

🎯 LIVRABLE ATTENDU
Génère le code TypeScript / React / Tailwind CSS complet de SPC Intelligence (`ai.stafprint.com`), comprenant la page `/login` à onglets, le service Gemini 2.5 Flash avec rotation sur les 3 clés API, la gestion complète de la sidebar (épinglage max 3, renommage, suppression, isolation par compte, volet détails de la conversation) et la bascule intelligente entre Espace Public (3 msgs/jour) et Espace Profil connecté.
***
NB : Theme Sombre + claire
zone de recherche
Sidebar fixe même si contenu de chat long
Zone de texte adaptatif au contenu (taille auto), et bas de la zone de chat fixe
notice avant de chater (comme condition d'uitlisation)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8acf10f-f1fc-463a-b821-dc67c0c0c8be).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
