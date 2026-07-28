---
name: welds
description: Prototype ou explore un écran welDS (Accor/ALL) en HTML/CSS — version standalone sans MCP, pour designers en exploration rapide. Déclencheurs — "prototype un écran welDS", "explore un concept welDS", "code-moi un écran welDS", "brainstorm visuel welDS", "concept UI welDS", "page welDS", "esquisse d'écran welDS", "draft un écran welDS", "login welDS", "booking welDS", "hotel welDS". Lit DESIGN.md + snippets.md locaux (à côté de ce SKILL.md) et compose du HTML/CSS en utilisant les var CSS welDS, les 12 atomes fournis, et les règles non-négociables du DS.
---

# welds — Skill standalone welDS

## Contexte

Ce skill est la version **standalone** du support welDS pour Claude Code : il ne dépend
pas du MCP welDS. Il est fourni dans le cadre du starter package pour designers Accor en
**exploration / prototypage rapide**.

**Ne convient pas** pour :
- L'intégration pixel-perfect d'une maquette Figma existante (nécessite le MCP + `welds-integrate`).
- Le développement de features production (nécessite les vrais composants React welDS via le MCP).

## Ressources locales (à lire AVANT de répondre)

Les 2 fichiers suivants sont livrés avec ce skill à côté de ce `SKILL.md` dans
`~/.claude/skills/welds/`. **Toujours les lire avant la première réponse** :

1. **`DESIGN.md`** — snapshot Google Stitch du welDS brandbook (tokens colors, typography,
   rounded, spacing, components). Format machine-readable (YAML front matter) + prose
   humaine (8 sections).

2. **`snippets.md`** — 12 atomes welDS en HTML/CSS ready-to-copy. Un fallback pour
   construire rapidement un écran sans avoir à tout recoder.

Utiliser l'outil `Read` pour lire ces fichiers en début de workflow.

## Règles non-négociables

1. **Jamais de hex hardcodé.** Toutes les couleurs via `var(--color-*)`. Toutes les tailles
   via tokens `var(--font-size-*)`, `var(--spacing-stack-*)`, `var(--radius-*)`.
   Seule exception : valeurs < 4px non tokenisées.

2. **Text styles complets.** Toujours appliquer un bundle typography cohérent (family +
   size + weight + line-height + letter-spacing). Jamais `font-family` seul.

3. **Préférer les snippets fournis** au lieu de recoder un bouton/input/card de zéro.
   Si un atome correspond, utiliser le snippet exact.

4. **Un seul bouton primary par écran.** Le reste en secondary / tertiary.

5. **`input[type="password"]` standard pour login.** (`input-password` avec UI spéciale
   est réservé à la registration — dans ce starter, on ne le propose pas.)

6. **Brand par défaut = `brandbook`.** Assumer `<body class="brand-brandbook">` sauf mention
   contraire du designer.

7. **Pas de React components welDS** dans ce mode. Le designer n'a pas le MCP — pas de
   `import { Button } from "@welds/react"`. Tout est HTML/CSS custom qui respecte les
   tokens.

8. **JSX : vrais caractères UTF-8** si le designer utilise React. Jamais d'escape
   `\uXXXX` — toujours `"→"`, `"é"`, `"•"`, `"✓"` en littéral.

9. **Composants hors 12 atomes** → proposer les règles DESIGN.md comme guide, mais
   signaler au designer qu'un composant complexe (heading-hero, booking-engine, etc.)
   serait mieux géré avec le MCP welDS complet.

## Workflow (4 étapes)

### Étape 1 — Load ressources (silencieux)

Au premier message qui déclenche le skill :

```
Read ~/.claude/skills/welds/DESIGN.md
Read ~/.claude/skills/welds/snippets.md
```

Mettre en cache mental pour toute la session.

### Étape 2 — Discovery (3 questions max)

```
1. Scope — composant isolé, section, ou écran complet ? (défaut : section)
2. Breakpoint — mobile, tablet, desktop-sm, desktop-md ? (défaut : desktop-md)
3. Brand — brandbook (défaut), sofitel, fairmont, pullman, raffles, ibis, novotel,
   mgallery, movenpick, handwritten, swissotel, all ?
```

Si le designer répond "defaults" / "fais au mieux" → tous les defaults, sans re-demander.

### Étape 3 — Composition

1. Identifier les atomes nécessaires à partir des snippets disponibles.
2. Si un atome manque : construire en suivant strictement les tokens de DESIGN.md.
3. Assembler l'écran en respectant le rythme de spacing welDS (`--spacing-stack-*`),
   la grille (padding container proportionnel au breakpoint), les text styles welDS.
4. Mettre la classe brand sur le container de l'exemple : `<div class="brand-sofitel">` si
   le brand choisi n'est pas brandbook.

### Étape 4 — Setup du projet (si pas déjà fait)

Si le designer n'a pas encore configuré son projet, rappeler en 1 ligne :

```
Rappel : importe les CSS dans ton entry (main.tsx / layout.tsx) :
  import "./tokens/base.css";
  import "./tokens/brands.css";
Et ajoute la classe brand sur <body>.
```

## Rapport final

Court, après la livraison :

```
✨ Écran welDS prototypé (standalone)

📦 Snippets utilisés — 5
   • button ×2 (primary ×1, secondary ×1)
   • input-text ×3
   • link ×1

🎨 Brand : brandbook
📱 Breakpoint : desktop-md

🎯 Fichier : src/components/LoginScreen.tsx (80 lignes, 0 hex hardcodé)

💡 Notes
   • J'ai utilisé "secondary" pour le bouton "Mot de passe oublié" (un seul primary
     par écran, règle welDS).
   • Pour aller plus loin (Figma existant, pixel-perfect, organismes welDS), demande
     à Adrian l'accès au MCP welDS complet.
```

## Edge cases

- **Designer demande un organisme** (heading-hero, billboard, card-offer, booking-engine,
  callout-hotel, etc.) → signaler que ce starter est limité aux 12 atomes, proposer soit
  une approximation à partir des atomes, soit rediriger vers le MCP welDS complet.
- **Designer n'a pas importé les CSS** → check si les var `--color-*` / `--font-size-*`
  sont disponibles (peut être détecté si le projet vient d'être installé). Si absent,
  afficher les 2 lignes d'import et la classe brand avant de coder.
- **Designer demande un brand WIP** (ibis, novotel, mgallery, movenpick, swissotel) →
  rappeler que ces brands sont en WIP (noté dans le DESIGN.md), mais procéder quand même.

## Scénario exemple

```
Designer :
> prototype-moi un écran login welDS

Claude (skill activé) :
> [Read DESIGN.md + snippets.md silencieusement]
>
> 3 questions rapides :
> 1. Scope — écran complet ? (défaut : oui)
> 2. Breakpoint — desktop-md ? (défaut)
> 3. Brand — brandbook (défaut) ?

Designer :
> defaults, mobile plutôt

Claude :
> OK. Je compose : input-text email + input-text type="password" + checkbox
> "Se souvenir de moi" + button primary "Connexion" + link "Mot de passe oublié".
>
> [génère src/components/LoginScreen.tsx qui utilise les snippets]
>
> ✨ Écran welDS prototypé (standalone) [...]
```

## Notes pour l'agent

- **Ce skill est lightweight par design.** Ne pas sur-ingénierer (pas de diff visuel, pas
  de manifest d'assets, pas d'inspection Figma).
- **Pas de MCP welDS** dans cette config — si le designer commence à demander des
  organismes ou une maquette Figma, ce n'est pas le bon skill.
- **Si tu as besoin d'une couleur/taille hors de DESIGN.md** → c'est le signal d'un gap
  du DS. Signale-le au designer, ne pas inventer.
- **Une fois les fichiers lus**, pas besoin de les re-lire à chaque message dans la même
  session.

Fin.
