# pages/ — pages remplies (sortie locale)

Ici atterrissent les **pages générées** : un template `templates/<marque>/<type>.html` rempli avec
le contenu réel d'un hôtel (nom, adresse, chambres, prix, photos). Rangées par marque :

```
pages/<marque>/<type>-<instance>.html
```

- **Créer** une page = remplir un template → skill `welds-fill-template` (remplace les jetons `{{...}}`
  et le lorem par le vrai contenu, extrait des URL de prod / Figma).
- `templates/<marque>/` et `pages/<marque>/` sont à la **même profondeur** → remplir = copier sans
  réécrire les chemins (`../../core/…`, `../../brands/<marque>/…`).

Ce dossier est **local** (hors plugin partagé) : il contient du contenu spécifique, pas de l'agnostique.
