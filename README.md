# Richard Store

Boutique e-commerce pour produits électriques, électroniques et accessoires, avec commande finalisée via WhatsApp. Next.js (App Router) + TypeScript + Supabase.

## 1. Structure du projet

```
richard-store/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Accueil
│   │   ├── catalogue/               # Catalogue public (recherche + filtres)
│   │   ├── produit/[slug]/          # Fiche produit
│   │   ├── admin/
│   │   │   ├── login/               # Connexion admin
│   │   │   └── (dashboard)/         # Dashboard protégé (stats, produits, catégories, paramètres)
│   │   ├── confidentialite/, conditions/
│   │   ├── sitemap.ts, robots.ts
│   │   └── globals.css
│   ├── components/                  # UI (shadcn-like) + composants métier
│   ├── lib/                         # supabase clients, config, validations, requêtes, whatsapp, prix
│   └── actions/                     # Server Actions (auth, produits, catégories, paramètres)
├── supabase/schema.sql              # Schéma complet à exécuter dans Supabase
├── scripts/seed.ts                  # Données de démonstration
└── .env.example
```

## 2. Installation

```bash
npm install
cp .env.example .env.local
```

## 3. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **Project Settings > API**, récupérez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ jamais exposée au frontend)
3. Collez ces valeurs dans `.env.local`.
4. Ouvrez **SQL Editor** dans Supabase, collez le contenu de `supabase/schema.sql` et exécutez-le. Cela crée : les tables `products`, `categories`, `store_settings`, les règles de sécurité (RLS) et le bucket de stockage `product-images`.

## 4. Créer le premier compte administrateur

Aucune inscription publique n'existe (par sécurité). Créez le compte manuellement :

1. Dans Supabase, allez dans **Authentication > Users > Add user**.
2. Renseignez un e-mail et un mot de passe (auto-confirmé).
3. Connectez-vous ensuite sur `/admin/login` avec ces identifiants.

Vous pouvez créer plusieurs comptes admin de cette façon.

## 5. Lancer le projet en local

```bash
npm run dev
```

Le site est disponible sur http://localhost:3000, l'admin sur http://localhost:3000/admin/login.

### (Optionnel) Charger des produits de démonstration

```bash
npm run seed
```

Crée quelques catégories et produits fictifs (marqués comme démonstration) pour tester l'interface. À supprimer avant la mise en production réelle (via l'admin, ou directement dans Supabase : `delete from products where is_demo = true`).

## 6. Déployer en production (Vercel)

1. Poussez le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), importez le dépôt.
3. Renseignez les variables d'environnement (les mêmes que `.env.local`), y compris `NEXT_PUBLIC_SITE_URL` avec votre vraie URL de production.
4. Déployez. Vercel détecte automatiquement Next.js.
5. Dans Supabase, ajoutez l'URL de production dans **Authentication > URL Configuration** (Site URL et Redirect URLs) pour que l'authentification fonctionne.

## 7. Configuration rapide

- **Nom, WhatsApp, devise, réseaux sociaux** : modifiables directement dans `/admin/parametres`, sans toucher au code.
- **Numéro WhatsApp actuel** : +228 92 05 61 83.
- Valeurs par défaut (repli) : `src/lib/config.ts`.

## 8. Fonctionnalités terminées

- Catalogue public : recherche, filtre par catégorie, grille responsive
- Fiche produit : galerie, prix normal/promo/réduction calculée automatiquement, disponibilité, bouton WhatsApp
- Commande WhatsApp : message prérempli généré dynamiquement avec les vraies infos du produit
- Page d'accueil : hero, catégories, promotions, nouveautés, avantages, contact
- Admin : connexion/déconnexion sécurisées (Supabase Auth), tableau de bord avec statistiques
- Admin produits : création, modification, suppression, publier/dépublier, disponible/épuisé, upload multi-images (Supabase Storage)
- Admin catégories : création, suppression (bloquée si des produits l'utilisent encore)
- Admin paramètres : nom boutique, WhatsApp, devise, réseaux sociaux
- SEO : titres/meta par page, URLs propres, données structurées produit (JSON-LD), sitemap.xml, robots.txt
- Sécurité : RLS Supabase, clé service_role jamais exposée, routes /admin protégées par middleware

## 9. Reste à configurer selon vos besoins

- Remplacer les produits de démonstration par vos vrais produits
- Personnaliser les couleurs/logo si besoin (`src/app/globals.css`, section `@theme`)
- Ajouter votre propre nom de domaine sur Vercel
- Optionnel : système de paiement en ligne (non inclus, comme demandé — la commande se finalise sur WhatsApp)

## 10. Tests effectués

Le code a été écrit et relu intégralement (schéma SQL, RLS, server actions, formulaires, calculs de promotion, génération du lien WhatsApp, protection des routes admin). L'exécution réelle (`npm install` / `npm run dev` / déploiement) doit être faite de votre côté car cet environnement de développement n'a pas d'accès réseau pour installer les dépendances ni héberger un serveur — voir la checklist ci-dessous à dérouler après `npm install`.

### Checklist à vérifier après installation

- [ ] `npm run dev` démarre sans erreur
- [ ] Page d'accueil, catalogue, fiche produit s'affichent
- [ ] Recherche et filtre catégorie fonctionnent
- [ ] Prix normal/promo/réduction s'affichent correctement
- [ ] Le bouton WhatsApp ouvre bien wa.me avec le bon message
- [ ] Connexion admin fonctionne, `/admin` redirige vers `/admin/login` si déconnecté
- [ ] Ajout/modification/suppression de produit fonctionne, y compris upload d'images
- [ ] Publier/dépublier et disponible/épuisé changent bien l'affichage public
- [ ] Ajout/suppression de catégorie fonctionne
- [ ] Affichage mobile (360–412px) et desktop
