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
npm run test:e2e   # tests d'interaction Playwright (après npm run build)
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

Toutes les pages appellent les fonctions `async` de `src/lib/api.ts` (lectures). Les écritures (valider un KYC, trancher un litige, libérer des fonds…) passent par `src/lib/actions.ts` : chaque fonction doit se résoudre seulement quand l'API a confirmé, et lever une `Error` avec un message lisible sinon. Remplacer leur corps par des `fetch` (ou des Server Actions) suffit, l'interface gère déjà les états.

Pour tester les cas lents et les échecs sans backend : ajouter `?simuler=lent` ou `?simuler=echec` à l'URL (mémorisé pour l'onglet, `?simuler=normal` pour revenir).

## Interactions et motion

Règles communes à tout le dashboard, à respecter pour les nouveaux écrans.

**Tokens** (`globals.css`, miroir JS dans `src/lib/motion.ts`)

| Token | Valeur | Usage |
|---|---|---|
| `--duration-instant` | 120 ms | pression, couleur, hover |
| `--duration-fast` | 160 ms | tooltips, petits changements d'état |
| `--duration-base` | 200 ms | onglets, entrée de page, toasts (sortie) |
| `--duration-slow` | 260 ms | sheets, dialogues, largeur du menu |
| `--duration-drawer` | 300 ms | menu mobile |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | entrées |
| `--ease-in` | `cubic-bezier(.55,0,1,.45)` | sorties |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | changements d'état |

Utilisation : `duration-(--duration-base) ease-(--ease-out)`. Pas de rebond ni d'effet élastique. Les animations d'entrée utilisent le remplissage `backwards` : une fois finies, elles ne laissent ni transform ni opacité (sinon les éléments `fixed` à l'intérieur seraient piégés).

**Briques**

- `pressable` (utilitaire CSS) : légère compression au clic sur tout ce qui est cliquable.
- `Button loading` : spinner à taille constante, apparaît après 150 ms (pas de clignotement sur les appels rapides), clics ignorés.
- `useAsyncAction` (`src/hooks`) : `idle → pending → success | error`, bloque la double soumission, ignore les résultats après démontage, expose `args` pour savoir quel bouton tourne.
- `ActionError` : erreur persistante, annoncée (`role="alert"`), avec « Réessayer ». `useToast()` : confirmations temporaires (4 s, pause au survol). Jamais de succès affiché avant la réponse de l'API.
- `Sheet` : portail, entrée/sortie animées, focus piégé puis rendu au déclencheur, scroll de la page bloqué, Escape. `busy` empêche de fermer pendant une opération.
- `useOverlay` : comportement commun des couches modales (pile Escape, focus, scroll). `usePresence` : garde un élément monté pendant sa sortie.
- `Field` relie automatiquement le message d'aide ou d'erreur au champ (`aria-describedby`, `aria-invalid`). Les erreurs apparaissent à la soumission ou en quittant un champ rempli, pas pendant la première saisie.
- Les opérations qui déplacent de l'argent ou suppriment (litige, libération de séquestre, suppression produit, suspension) passent par une confirmation.

**Menu latéral**

- Desktop (≥ 1024 px) : repliable en rail d'icônes (bouton « Réduire le menu »), état mémorisé et appliqué avant le premier rendu (pas de saut au chargement). Libellés en fondu, tooltips en mode replié, indicateur actif qui glisse d'un élément à l'autre (transform). L'élément actif vient de l'URL (`usePathname`), un point orange signale une navigation en cours.
- Mobile admin : panneau overlay depuis la gauche, backdrop en fondu, focus piégé, fermeture par ✕, backdrop, Escape ou navigation, scroll et focus restaurés, safe areas respectées. Passer au-dessus de 1024 px le ferme et rend la main au rail.
- Mobile vendeur : barre d'onglets inchangée, avec retour au toucher.

**Mouvement réduit** : avec `prefers-reduced-motion`, plus aucun déplacement (slides, montée de page, compression), seuls des fondus très courts restent pour que les changements d'état restent visibles.

**Tests** : `e2e/` couvre menu (repli rapide, navigation pendant l'animation, URL directe, tooltip), menu mobile (focus, Escape, backdrop, redimensionnement), sheets (clavier, opération en cours), états async (lent, échec puis réessai, clics multiples), formulaires, mouvement réduit, absence d'erreurs console et de débordement horizontal sur les 25 écrans, en desktop et mobile.
