# STAF PRINT CENTER - Plateforme Web (V1)

Ce dépôt contient le code source de la plateforme web officielle de **STAF PRINT CENTER** (`stafprint.com`), studio de création, d'impression numérique et de formation basé à Porto-Novo, Bénin - depuis 2019.

> L'empreinte de votre succès.

---

## 📌 Présentation du projet

La plateforme présente l'activité de STAF PRINT CENTER, valorise ses réalisations et facilite la prise de contact avec les clients, tout en donnant accès à un espace admin, un espace étudiant et des outils dédiés (QR codes, newsletter).

Elle s'articule autour des pages suivantes :

- **Accueil** - Présentation du studio, argumentaire (qualité premium, délais courts, prix accessibles, expertise locale), avis Google, formulaire de contact / demande de devis.
- **Services** (`/services`) - Catalogue des prestations d'impression, de design graphique et d'identité visuelle, filtrable par catégorie.
- **Réalisations** (`/projects`) - Portfolio des projets clients, filtrable et paginé.
- **Formations** (`/trainings`) - Programmes de formation (design, web, numérique) avec pré-inscription.
- **Blog** (`/articles`) - Contenus métiers et actualités du studio.
- **FAQs** (`/faqs`) - Questions fréquentes.
- **Offres d'emploi** (`/careers/offers`) - Offres d'emploi, candidatures et demandes de stage.
- **Contact** (`/#contact`) - Formulaire de demande de devis avec sélection du service souhaité.
- **Newsletter** (`/tools/newsletter`) - Inscription à la newsletter.
- **Mentions légales / Confidentialité / CGV** (`/legal/*`).

---

## 🛠️ Stack technique

- **Frontend :**
  React + TanStack Router + TanStack Query, décliné sur plusieurs sous-domaines :
  - `stafprint.com` - site public
  - `admin.stafprint.com` - back-office (gestion des services, projets, formations, offres, avis clients, bannières/annonces, newsletter)
  - `student.stafprint.com` - espace étudiant / formations
  - `go.stafprint.com` - liens courts / QR codes

- **Backend :**
  API REST Laravel 11, PHP 8.4, hébergement mutualisé alwaysdata.
  Modules principaux : newsletter, avis clients (formulaire dynamique), pré-inscription aux formations, offres d'emploi & candidatures, demandes de stage, annonces/bannières, gestion des QR codes.

- **Performance & SEO :**
  - Structure optimisée pour les moteurs de recherche
  - Metadata Open Graph / Twitter Card
  - Données structurées Schema.org
  - Optimisation des ressources statiques (CDN jsDelivr pour les assets)

- **Intégrations :**
  - Formulaires de contact et de demande de devis (avec sélection de service)
  - Intégration WhatsApp pour la communication directe
  - Réseaux sociaux : Facebook, Instagram, LinkedIn, X

---

## 🎯 Objectifs V1

- Présenter clairement l'offre STAF PRINT CENTER (print, design, formations)
- Améliorer la visibilité digitale de l'entreprise
- Faciliter la génération de prospects via les devis et WhatsApp
- Valoriser les réalisations, avis clients et l'expertise du studio
- Centraliser la gestion opérationnelle (back-office admin) et l'espace étudiant

---

## 📂 Organisation du projet

```
/
├── apps/
│   ├── web/          # Frontend public (stafprint.com)
│   ├── admin/         # Back-office (admin.stafprint.com)
│   └── student/        # Espace étudiant (student.stafprint.com)
├── api/               # Backend Laravel 11 (REST API)
├── packages/
│   └── shared/         # Types, composants et utilitaires partagés (pattern api-frontend-sync)
└── public/            # Fichiers publics / assets statiques
```

---

## 🚀 Déploiement

- Site public : https://stafprint.com
- Back-office : https://admin.stafprint.com
- Espace étudiant : https://student.stafprint.com
- Liens courts / QR codes : https://go.stafprint.com

---

## 📍 Informations

**STAF PRINT CENTER**
Studio de création & impression
Porto-Novo, Bénin · Depuis 2019

- 📞 +229 01 66 52 36 39
- 💬 WhatsApp : +229 01 60 30 06 07
- ✉️ contact@stafprint.com

> L'empreinte de votre succès.