#!/usr/bin/env bash
# catalog.sh — génère le CATALOGUE des composants <wd-*> (tag + attributs lus) depuis components.js.
# Sert : d'ANTI-DOUBLON (mode create), de RAYON D'IMPACT (mode update), et de CONTRAT D'ATTRIBUTS
# (les jetons de contenu d'un gabarit doivent reprendre ces attributs). Sortie : docs/COMPONENTS.md.
# Isolation par balayage d'accolades (corps de classe exact). À lancer depuis la racine du projet.
set -euo pipefail
python3 - <<'PY'
import re
src = open('core/components/components.js').read()

def class_body(after):
    """corps de la 1re classe à partir de l'index `after` (balayage d'accolades)."""
    i = src.find('{', after)
    if i < 0: return ''
    depth = 0
    for j in range(i, len(src)):
        if src[j] == '{': depth += 1
        elif src[j] == '}':
            depth -= 1
            if depth == 0: return src[i:j+1]
    return src[i:]

def attrs_of(body):
    a = set(re.findall(r'(?:attr|list|has)\("([^"]+)"', body))
    a |= set(re.findall(r'getAttribute\("([^"]+)"', body))
    return a

# attributs de la base Carousel (partagés wd-rooms / wd-collection)
carousel_attrs = set()
m = re.search(r'class\s+Carousel\b', src)
if m:
    body = class_body(m.end())
    carousel_attrs = set(re.findall(r'(?:^|[^A-Za-z])(?:a|list)\("([^"]+)"', body))

rows = []
for m in re.finditer(r'def\("(wd-[a-z-]+)",\s*class', src):
    tag = m.group(1)
    header = src[m.start():src.find('{', m.end()) + 1]   # "... class extends X {"
    body = class_body(m.end())
    attrs = attrs_of(body)
    if 'extends Carousel' in header:
        attrs |= carousel_attrs
    rows.append((tag, sorted(a for a in attrs if a)))

out = ["# Catalogue des composants welDS (généré)",
       "",
       "> Généré par `scripts/catalog.sh` depuis `core/components/components.js`.",
       "> Sert d'**anti-doublon** (create), de **rayon d'impact** (update), et de **contrat d'attributs** :",
       "> les jetons de contenu d'un gabarit doivent **reprendre ces attributs** (pas de noms inventés).",
       "",
       f"{len(rows)} composants.",
       "",
       "| Composant | Attributs lus |", "|---|---|"]
for tag, attrs in rows:
    out.append(f"| `<{tag}>` | {', '.join('`'+a+'`' for a in attrs) if attrs else '—'} |")
open('docs/COMPONENTS.md', 'w').write("\n".join(out) + "\n")
print(f"docs/COMPONENTS.md généré : {len(rows)} composants")
PY
