# Templates welDS — PAR MARQUE (à créer en local)

Un template = **une marque + un type de page**, marque **figée** (`body.brand-<marque>` + couche
`brands/<marque>/`). On le crée une fois depuis une maquette Figma, puis on le **remplit** (contenu
extrait des URL de prod) pour générer d'autres pages de la même marque. Seuls les **jetons de contenu**
`{{...}}` varient. Rangés par marque ; **hors plugin** (chaque designer crée les templates de sa marque).

```
templates/
  <marque>/<type-de-page>.html
```

*(Base vanilla : aucun template fourni. Crée le tien — voir Workflow.)*

| Template | Marque | Type de page | Source |
|---|---|---|---|
| _(à créer)_ | _<marque>_ | _<type>_ | _Figma node + URL prod_ |

## Conventions
- **Chemins** : `../../core/...` (composants/styles/tokens agnostiques) + `../../brands/<marque>/...`
  (couche de marque). `templates/<marque>/` et `pages/<marque>/` sont à la **même profondeur** → remplir
  = copier vers `pages/<marque>/` **sans réécrire les chemins**.
- `{{JETON}}` = contenu à remplacer · lorem = prose à remplacer.
- Images = ID Scene7 Accor dans `m.ahstatic.com/is/image/accorhotels/<ID>`.

## Workflow
- **Créer** un template (nouvelle marque ou nouveau type de page) → skill `welds-create-template`
  (reverse-engineering d'une maquette Figma ; URL prod facultative).
- **Remplir** un template avec un vrai hôtel/contenu → skill `welds-fill-template` (sort dans `pages/<marque>/`).
- **Maintenir un composant** (créer/variante/update/audit) → skill `welds-component`.
- Méthodo + apprentissages + pièges → `../docs/DESIGN.md`.
