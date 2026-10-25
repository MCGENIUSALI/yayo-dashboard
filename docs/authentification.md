# Authentification et sessions

Connexion par e-mail + mot de passe et par Google (OpenID Connect), sessions serveur, récupération de compte, vérification d’adresse, gestion des appareils. Tout est vérifié côté serveur : l’interface n’est jamais la source d’autorité.

## Architecture

| Couche | Rôle | Fichiers |
|---|---|---|
| Proxy | Nonce CSP par requête, redirection *optimiste* vers `/connexion` sans cookie. Ne décide jamais qu’un utilisateur est connecté. | `src/proxy.ts`, `next.config.ts` (en-têtes) |
| Gardes | `requireUser()` / `requireRole()` revalident la session en base à chaque requête (layouts, pages, couche de données). | `src/lib/auth/server.ts` |
| Couche de données | Chaque fonction de `src/lib/api.ts` vérifie elle-même le rôle (`seller` ou `admin`). | `src/lib/api.ts` |
| Server Actions | Formulaires d’auth : POST same-origin uniquement, résultats sans secret, redirections serveur. | `src/lib/auth/actions.ts` |
| Cas d’usage | Inscription, connexion, reset, vérification, changement de mot de passe, Google. Testables sans Next. | `src/lib/auth/service.ts`, `google-flow.ts` |
| Route handlers | Callback Google, nettoyage d’une session expirée, `GET /api/me` (401 en JSON). | `src/app/auth/**`, `src/app/api/me` |
| Base | Postgres, requêtes paramétrées (`pg`), migrations SQL versionnées et réversibles. | `src/lib/db.ts`, `db/migrations/` |

### Modèle de données (`db/migrations/0001_auth.up.sql`)

- `users` : e-mail normalisé unique, nom, hash Argon2id (nullable pour un compte Google seul), `roles` (`seller`, `admin`), `status` (`active`, `suspended`), date de vérification.
- `user_identities` : identité Google liée par le `sub` stable (jamais par l’e-mail).
- `sessions` : clé = SHA-256 du jeton (le jeton n’existe que dans le cookie), `public_id` pour l’écran des appareils, durées d’inactivité et absolue, révocation.
- `auth_tokens` : liens de vérification et de réinitialisation, stockés hachés, usage unique, expiration.
- `auth_rate_limits` : compteurs partagés entre instances serverless, clés HMAC.
- `auth_events` : journal de sécurité (identifiants et hash d’IP uniquement).

Aucun jeton Google n’est conservé : la session applicative suffit.

### Sessions

Identifiant opaque de 256 bits dans un cookie `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` et préfixe `__Host-` en HTTPS. Jamais lisible en JavaScript, jamais en `localStorage`. Pas de JWT : la révocation est immédiate puisque chaque requête consulte la base.

| Type | Cookie | Inactivité | Durée absolue |
|---|---|---|---|
| Standard | session de navigateur | 12 h | 24 h |
| « Se souvenir de moi » | persistant | 7 jours | 30 jours |
| Compte administrateur | session de navigateur (option ignorée) | 2 h | 12 h |

- Nouvel identifiant à chaque connexion, l’ancien cookie du navigateur est révoqué (fixation de session).
- Changement de mot de passe : toutes les sessions révoquées, nouvel identifiant pour l’appareil courant.
- Réinitialisation : toutes les sessions révoquées, pas de connexion automatique.
- Compte suspendu : ses sessions sont refusées immédiatement.
- 20 sessions actives au maximum par compte (les plus anciennes sont révoquées).
- Déconnexion : révocation en base **puis** suppression du cookie avec ses attributs d’origine, cache du routeur vidé, autres onglets prévenus (`BroadcastChannel`), retour arrière renvoyé vers la connexion.

### Google

Flux *authorization code* pour client web confidentiel, avec `state` (CSRF de connexion), `nonce` (rejeu du jeton d’identité) et PKCE S256. Le `state`, le `nonce` et le vérificateur PKCE sont gardés 10 minutes dans un cookie HttpOnly signé (HMAC `AUTH_SECRET`), consommé au callback. Le jeton d’identité est vérifié avec `jose` contre les clés publiques de Google : signature RS256, émetteur, audience, `azp`, expiration, `nonce`, `email_verified`.

Un compte e-mail existant n’est **jamais** lié automatiquement : l’utilisateur se connecte avec son mot de passe puis associe Google depuis *Mon compte › Sécurité*, en ressaisissant son mot de passe.

### Protections

- **Mots de passe** : Argon2id (19 MiB, 2 passes, 1 voie), 10 à 128 caractères sans troncature, normalisation NFKC, refus des mots de passe présents dans Have I Been Pwned (k-anonymity, 5 caractères du SHA-1 envoyés ; si le service ne répond pas, l’inscription passe et l’incident est journalisé).
- **Énumération** : mêmes messages et temps de réponse comparables pour « adresse inconnue » et « mauvais mot de passe » ; inscription et « mot de passe oublié » répondent pareil que le compte existe ou non (le propriétaire d’un compte existant reçoit un avertissement par e-mail).
- **Limitation de débit** (fenêtres fixes en Postgres, jamais de blocage définitif) :

  | Action | Par IP | Par compte |
  |---|---|---|
  | Connexion | 100 / 15 min | 8 / 15 min |
  | Inscription | 10 / h | – |
  | Mot de passe oublié | 10 / 15 min | 3 e-mails / h (silencieux) |
  | Renvoi du lien de vérification | 10 / 15 min | 3 e-mails / h (silencieux) |
  | Soumission d’un lien (reset, vérification) | 20 / 15 min | – |
  | Callback Google | 60 / 15 min | – |
  | Changement de mot de passe, confirmation | – | 6 / 15 min |

  La limite par IP est large car les opérateurs mobiles de Kinshasa partagent une même IP entre de nombreux clients (CGNAT). Elle s’appuie sur `x-forwarded-for` uniquement derrière Vercel (ou `AUTH_TRUST_PROXY=1`).
- **CSRF** : Server Actions en POST, contrôle Origin/Host de Next.js **et** contrôle Origin explicite, cookies `SameSite=Lax`.
- **XSS** : rendu React échappé, CSP stricte avec nonce par requête et `strict-dynamic`, aucun HTML utilisateur injecté.
- **Redirections** : paramètre `suite` limité aux chemins internes `/vendeur`, `/admin`, `/compte`, sinon `/`.
- **Liens e-mail** : jetons de 256 bits hachés en base, usage unique atomique, 24 h (vérification) et 30 min (réinitialisation, un nouveau lien annule le précédent). Pages en `Referrer-Policy: no-referrer`, jeton retiré de la barre d’adresse dès l’ouverture. La vérification demande un clic : les antivirus de messagerie qui préchargent les liens ne la consomment pas.
- **En-têtes** : CSP, HSTS, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, `X-Powered-By` retiré.
- **Journaux** : jamais de mot de passe, cookie, jeton, ni adresse e-mail ; erreurs génériques côté client, pas de stack trace.

## Rôles

`seller` ouvre `/vendeur`, `admin` ouvre `/admin`. Une inscription crée un compte `seller`. Les rôles ne s’attribuent jamais depuis le navigateur :

```bash
DATABASE_URL=… npm run auth:roles -- personne@exemple.com seller,admin
```

La commande révoque les sessions du compte pour que les nouveaux droits s’appliquent à la prochaine connexion.

## Configuration

Copier `.env.example` en `.env.local` (jamais versionné). Aucune variable n’est `NEXT_PUBLIC_`.

| Variable | Obligatoire | Rôle |
|---|---|---|
| `APP_URL` | oui (déduite sur Vercel) | URL publique : liens des e-mails, redirect URI Google, cookies `Secure` si `https://` |
| `DATABASE_URL` | oui | Postgres (Neon : URL *pooled* avec `sslmode=require`) |
| `AUTH_SECRET` | oui, 32+ caractères | Signature du state OAuth, clés HMAC des journaux et compteurs. `openssl rand -base64 48` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | pour Google | Client OAuth web. Sans eux, le bouton Google est désactivé et l’indique |
| `EMAIL_TRANSPORT` | non (`resend`) | `resend` en production, `file` en local et en test (refusé en production) |
| `RESEND_API_KEY`, `EMAIL_FROM` | avec `resend` | Clé Resend et expéditeur sur un domaine vérifié |
| `EMAIL_FILE_DIR` | avec `file` | Dossier où les e-mails sont écrits (ignoré par Git) |
| `AUTH_PASSWORD_BREACH_CHECK` | non (`on`) | Vérification Have I Been Pwned |
| `AUTH_TRUST_PROXY` | non | `1` uniquement derrière un proxy qui réécrit `x-forwarded-for` (automatique sur Vercel) |

Si la configuration est incomplète, les écrans affichent « Connexion indisponible » et le serveur journalise le **nom** des variables manquantes, jamais leur valeur.

### Identifiants Google

1. [Google Cloud Console](https://console.cloud.google.com/) › créer ou choisir un projet.
2. *APIs & Services › OAuth consent screen* : type *External*, nom « YA YO! », e-mail d’assistance, domaine autorisé, scopes `openid`, `email`, `profile` (aucun scope sensible, pas de validation Google nécessaire). Publier l’application pour sortir du mode test.
3. *APIs & Services › Credentials › Create credentials › OAuth client ID* : type *Web application*.
   - *Authorized JavaScript origins* : `https://<domaine-de-production>` (et `http://localhost:3000` pour le développement).
   - *Authorized redirect URIs* : `https://<domaine-de-production>/auth/google/callback` (et `http://localhost:3000/auth/google/callback`).
4. Copier l’ID client et le secret dans `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (Vercel › Settings › Environment Variables, environnement *Production*).

Google exige des redirect URIs exactes : les URL de preview Vercel changent à chaque déploiement, la connexion Google n’y fonctionnera que si leur URL est ajoutée. La connexion par e-mail fonctionne partout.

### E-mails (Resend)

Créer un compte [Resend](https://resend.com), vérifier le domaine d’envoi (enregistrements DNS SPF/DKIM fournis), créer une clé API *Sending access*, renseigner `RESEND_API_KEY` et `EMAIL_FROM="YA YO! <no-reply@votre-domaine>"`.

## Base de données et migrations

```bash
npm run db:migrate              # applique les migrations en attente
npm run db:migrate -- status    # liste appliquées / en attente
npm run db:migrate -- down      # annule la dernière migration
```

Sur Vercel, l’intégration Neon (Storage › Create database › Neon) crée `DATABASE_URL`. Lancer `npm run db:migrate` une fois depuis un poste avec cette URL avant le premier déploiement, puis à chaque nouvelle migration.

## Développement local

```bash
cp .env.example .env.local      # puis ajuster DATABASE_URL et AUTH_SECRET
npm run db:migrate
npm run dev                     # http://localhost:3000
```

Avec `EMAIL_TRANSPORT=file`, les e-mails (liens de vérification et de réinitialisation) sont écrits en JSON dans `.mail/`.

## Déploiement HTTPS (Vercel)

1. Base Neon créée et migrée.
2. Variables *Production* : `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`. `APP_URL` si un domaine personnalisé est utilisé.
3. Premier compte administrateur : s’inscrire, confirmer l’adresse, puis `npm run auth:roles -- <email> seller,admin`.
4. Vercel sert tout en HTTPS : cookies `__Host-…; Secure`, HSTS, `upgrade-insecure-requests`.

## Rotation des secrets

| Secret | Procédure | Effet |
|---|---|---|
| `AUTH_SECRET` | Générer une nouvelle valeur, mettre à jour Vercel, redéployer | Les connexions Google en cours (< 10 min) échouent et sont à refaire ; compteurs de limitation remis à zéro. Les sessions restent valides. |
| `GOOGLE_CLIENT_SECRET` | Console Google › le client › *Add secret*, mettre à jour Vercel, redéployer, puis désactiver l’ancien | Aucun |
| `RESEND_API_KEY` | Créer une nouvelle clé, mettre à jour Vercel, redéployer, révoquer l’ancienne | Aucun |
| Mot de passe Postgres | Neon › *Reset password*, mettre à jour `DATABASE_URL`, redéployer | Courte indisponibilité pendant le redéploiement |
| Toutes les sessions | `UPDATE sessions SET revoked_at = now() WHERE revoked_at IS NULL;` | Tout le monde doit se reconnecter |

## Tests

```bash
npm test                        # unitaires + intégration (vitest) contre un vrai Postgres
npm run build && npm run test:e2e   # Playwright : parcours, sécurité, interface + tests existants
```

Les deux suites créent leur propre base jetable (`yayo_unit`, `yayo_e2e`) sur le serveur indiqué par `TEST_DATABASE_ADMIN_URL` (défaut `postgres://postgres:postgres@localhost:5432/postgres`). Google n’est jamais contacté : la vérification des jetons est testée avec des clés générées localement, et les tests de navigateur interceptent la redirection vers Google.

## Limites connues

- **Connexion Google réussie de bout en bout** : vérifiée en tests d’intégration (jeton signé localement) mais pas contre les vrais serveurs Google, faute d’identifiants. À valider après configuration du client OAuth.
- **Envoi réel des e-mails** : testé avec le transport fichier ; l’envoi Resend est à valider avec la vraie clé et le domaine.
- **Données métier** : les écrans vendeur et admin lisent toujours les données de démonstration de `src/lib/data`. L’accès est contrôlé par rôle, mais les données ne sont pas encore filtrées par vendeur : quand la vraie API sera branchée, elle devra vérifier que chaque ressource appartient à l’utilisateur de la session. Les écritures de `src/lib/actions.ts` restent simulées côté client.
- **Conditions d’utilisation et confidentialité** : aucun texte n’existe encore, donc ni lien ni case d’acceptation à l’inscription.
- **Téléphone + OTP** : le cahier des charges de l’app mobile prévoit téléphone/OTP ; ce dashboard suit la demande e-mail + Google.
- **Double authentification (TOTP)** pour les administrateurs : non implémentée, recommandée ensuite.
- **Contraste** : le gris tertiaire du design system (`neutral-500`) donne 4,3:1 sur blanc, sous le seuil AA de 4,5:1. Corrigé localement sur les écrans d’authentification, à corriger dans le design system.
