# Déployer le proto sur Vercel

**En ligne : https://sofitel-ny-proto.vercel.app** (public, non indexé).
Projet Vercel : `sofitel-ny-proto` (équipe nicolasgautier75-gmailcoms-projects).

Proto 100% statique (HTML/CSS/JS). Aucun build. Vercel sert les fichiers tels quels.

## Mettre à jour après une modif

Depuis ce dossier, une seule commande republie tout :
```
npx vercel --prod --yes
```
L'URL `sofitel-ny-proto.vercel.app` reflète la nouvelle version (le dossier est déjà lié via `.vercel/`).

## Accès

- **Public + non indexé** : `<meta name="robots" content="noindex">` sur les pages + `robots.txt` (Disallow). Accessible à qui a le lien, mais hors moteurs de recherche.
- La racine `/` sert le proto (réglé dans `vercel.json`).
- Note : la protection par mot de passe Vercel est un add-on PAYANT (non activé sur l'équipe), c'est pourquoi on est en public + noindex.

## Étapes (via npx, pas d'install globale, pas besoin de Git)

L'install globale `npm i -g vercel` échoue ici (prefix npm = `/usr/local`, non modifiable sans sudo).
On utilise `npx vercel` : le CLI est lancé à la volée (déjà en cache).

1. Se connecter une fois (ouvre le navigateur) :
   ```
   npx vercel login
   ```
2. Depuis ce dossier, déployer (URL de preview partageable) :
   ```
   npx vercel --yes
   ```
   `--yes` accepte les valeurs par défaut (nom du projet = nom du dossier, dossier racine, pas de build).
3. Mettre en production (URL stable) :
   ```
   npx vercel --prod --yes
   ```

Astuce : dans la session Claude Code, lance chaque commande sur **une seule ligne** précédée de `!`
(ex. `!npx vercel login`). Le `!` n'exécute qu'une ligne à la fois.

## Ce qui est en ligne

- `/` ouvre directement le proto (Sofitel New York). Réglé dans `vercel.json` (la racine pointe vers `pages/sofitel/hotel-homepage-new-york.html`).
- `/components.html` : le catalogue de composants (bonus).

## Ce qui n'est PAS déployé

Voir `.vercelignore` : dossiers internes (`.claude`, `scripts`, `templates`), notes (`DESIGN.md`). Le dossier `assets/` (polices Romie / GT America) EST déployé, sinon les polices casseraient.

## Alternative sans CLI

Aller sur vercel.com, "Add New > Project", glisser-déposer le dossier. Même résultat.
