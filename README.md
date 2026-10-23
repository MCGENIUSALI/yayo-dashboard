# YA YO! · Dashboard

Back-office de la marketplace congolaise **YA YO!** (paiement sous séquestre, livraison par code, couche social commerce) : **espace vendeur** et **administration**. Construit à partir du fichier Figma *marketplace-YAYO* (page *Design system* et pages 04_Admin / 07_App_Mobile_User_Stories).

- Next.js 16 (App Router, React Server Components) · TypeScript strict · Tailwind CSS 4
- Mobile first : barre d'onglets en bas pour le vendeur, menu latéral repliable pour l'admin, tableaux qui deviennent des cartes sous 768 px
- Thème clair / sombre basé sur les tokens sémantiques du design system
- Prix en FC avec l'équivalent USD (taux indicatif dans `src/lib/format.ts`)

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production
npm run lint
npm run typecheck
```

Node 20.9+ requis (voir `.nvmrc`).

## Déployer sur Vercel

1. Pousser ce dépôt sur GitHub.
2. Sur vercel.com : **Add New → Project**, importer le dépôt. Vercel détecte Next.js, aucune variable d'environnement n'est nécessaire.
3. Chaque push sur `main` déclenche un déploiement de production, chaque pull request une preview.

## Écrans

| Espace | Route | User story / écran Figma |
|---|---|---|
| Accueil | `/` | choix de l'espace |
| Vendeur | `/vendeur` | US-11 · V4 Tableau de bord |
| | `/vendeur/notifications` | US-11 · V13 Notifications |
| | `/vendeur/commandes` | US-13 · V5 Commandes (Nouvelles / À préparer / Prêtes / Livrées) |
| | `/vendeur/commandes/[id]` | US-13 · V6 Détail commande, calcul du net, rupture |
| | `/vendeur/commandes/[id]/remise` | US-13 · V7 Code de remise au livreur |
| | `/vendeur/produits` | US-12 · V8 Mes produits |
| | `/vendeur/produits/nouveau` | US-12 · V9-V10 Ajout en 2 étapes |
| | `/vendeur/produits/[id]` | US-12 · V14-V15 Modifier / supprimer |
| | `/vendeur/contenus` | US-24 · SV1 Mes publications |
| | `/vendeur/contenus/nouveau` | US-24 · SV2-SV3 Nouvelle publication, lier jusqu'à 5 produits |
| | `/vendeur/contenus/[id]` | US-25 · SV4 Statistiques et modération des commentaires |
| | `/vendeur/revenus` | US-14 · V11 Revenus, retrait Mobile Money |
| | `/vendeur/boutique` | US-14 · V12 Ma boutique |
| | `/vendeur/ouverture` | US-10 · V1-V3 Ouverture de boutique et KYC |
| Admin | `/admin` | AD1 Tableau de bord |
| | `/admin/commandes` | Commandes, statuts paiement + livraison synchronisés |
| | `/admin/sequestre` | AD4 Paiements et séquestre |
| | `/admin/litiges` | AD3 Litiges et décision |
| | `/admin/kyc` | AD2 Validations KYC |
| | `/admin/utilisateurs`, `/admin/utilisateurs/[id]` | Utilisateurs, suspension |
| | `/admin/livreurs` | Livreurs, cash à reverser |
| | `/admin/moderation` | Modération des commentaires sociaux (US-22) |
| | `/admin/commissions` | AD5 Commissions et frais |
| | `/admin/rapports` | Rapports |

## Architecture

```
src/
  app/                    routes (App Router) : pages serveur qui lisent les données
    vendeur/  admin/      un layout par espace (AppShell)
    globals.css           tokens du design system (primitives + sémantiques clair/sombre, 17 styles typo)
  components/
    ui/                   composants du design system (Button, Badge, PaymentBadge, KpiCard, DataTable, Sheet…)
    layout/               AppShell, navigation latérale / onglets, PageHeader
    seller/  admin/       composants métier (interactifs = "use client")
  lib/
    api.ts                couche d'accès aux données : seul fichier à brancher sur la vraie API
    data/                 données de démonstration
    types.ts              modèle : statuts escrow (9), livraison (5), commandes, produits, publications…
    format.ts             FC / USD, nombres compacts
    orders.ts             calcul du net vendeur (commande − commission − livraison)
```

Règles reprises du cahier des charges : commission prélevée sur le vendeur uniquement, fonds libérés 48 h après la livraison confirmée sauf litige, confirmation par code, aucun contact direct acheteur-vendeur (numéros et liens masqués dans les légendes et commentaires).

### Brancher le backend

Toutes les pages appellent les fonctions `async` de `src/lib/api.ts`. Remplacer leur corps par des `fetch` vers l'API YA YO suffit ; les actions (valider un KYC, trancher un litige, libérer des fonds…) sont aujourd'hui locales aux composants et pourront devenir des Server Actions.
