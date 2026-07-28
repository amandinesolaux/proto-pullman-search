# Recette — capturer Figma (source de vérité)

MCP `figma-console` (pont WebSocket / plugin Desktop Bridge). Le token REST n'est PAS configuré
→ tout passe par les outils plugin. Le fichier doit être ouvert dans Figma Desktop avec le plugin.

## 1. Vérifier la connexion
`figma_get_status({ probe: true })` → doit renvoyer `setup.valid: true`.

## 2. Capturer un node (image)
`figma_capture_screenshot({ nodeId: "3651:47072", scale: 2 })`
- Capture le **runtime** du plugin (fiable, reflète l'état réel).
- **Gros frames (page entière) = TIMEOUT** sur export. Capturer les **sous-nodes** (sections,
  composants) par leur id.

## 3. Trouver les sous-nodes (arbo)
`figma_execute` avec un walk shallow (profondeur 1-2) :
```js
const n = await figma.getNodeByIdAsync('NODE_ID');
const walk = (x,d,max)=>({id:x.id,name:x.name,type:x.type,
  w:Math.round(x.width||0),h:Math.round(x.height||0),
  children:(d<max&&x.children)?x.children.map(c=>walk(c,d+1,max)):undefined});
return walk(n,0,2);
```
- `getNodeByIdAsync` sur un node ÉNORME (homepage entière) peut timeout → viser un sous-node.
- `figma.root.findAll(...)` GLOBAL = timeout. Scoper à une page : `getNodeByIdAsync(pageId)` puis
  `.findAll(...)`, et wrapper en `try/catch` (certains nodes lèvent « Unknown node type »).

## 4. Lire une valeur EXACTE (couleur, texte, taille)
`figma_execute` qui lit les props du node :
```js
const n = await figma.getNodeByIdAsync('ID');
const hex = c => '#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const fill = (n.fills && n.fills!==figma.mixed && n.fills[0]?.type==='SOLID') ? hex(n.fills[0].color) : null;
const stroke = (n.strokes && n.strokes[0]?.type==='SOLID') ? hex(n.strokes[0].color) : null;
const t = n.findOne ? n.findOne(x=>x.type==='TEXT') : null;
return { fill, stroke, text: t && {chars:t.characters, size:t.fontSize, font:t.fontName} };
```
Utile pour relever un fond crème, une couleur de badge, un libellé exact — au lieu de deviner.

## 5. Lister les pages (repérage)
```js
await figma.loadAllPagesAsync();
const out=[]; for (const p of figma.root.children){ try{ out.push({id:p.id,name:p.name}); }catch(e){} }
return out;
```

## Méthode
Capturer → comparer au rendu headless (`render.sh`) → corriger → recomparer, **section par
section**. Si un élément ne peut pas être reproduit fidèlement (logo officiel externe…), le DIRE et
proposer des options. Secteur luxe : pas d'à-peu-près silencieux.
