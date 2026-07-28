#!/usr/bin/env bash
# probe-img.sh — valide des IDs image Scene7 Accor (kit Template-1.0).
# Pour chaque ID : code HTTP, taille en octets, empreinte md5 (8 car).
#  - taille < ~10 ko  → placeholder/ID invalide probable.
#  - même md5         → MÊME photo (doublon : ex. chambre accessible == supérieure → à éviter).
#
# Usage : scripts/probe-img.sh 2509_acf_066 2511_acf_960 25093_acf_342 ...
set -uo pipefail
BASE="https://m.ahstatic.com/is/image/accorhotels"
PARAMS="wid=600&hei=360&fit=crop&qlt=80"
SEENF="$(mktemp)"   # pas d'array associatif : compatible bash 3.2 (macOS)
for id in "$@"; do
  url="$BASE/$id?$PARAMS"
  body="$(curl -s "$url")"
  bytes="$(printf '%s' "$body" | wc -c | tr -d ' ')"
  code="$(curl -s -o /dev/null -w '%{http_code}' "$url")"
  md5="$(printf '%s' "$body" | openssl md5 2>/dev/null | awk '{print $NF}' | cut -c1-8)"
  prev="$(awk -v m="$md5" '$1==m{print $2; exit}' "$SEENF")"
  flag=""
  [ "$bytes" -lt 10000 ] && flag="$flag ⚠petit"
  [ -n "$prev" ] && flag="$flag ⚠doublon-de:$prev"
  printf '%-18s http=%s  %8s o  md5=%s%s\n' "$id" "$code" "$bytes" "$md5" "$flag"
  echo "$md5 $id" >> "$SEENF"
done
rm -f "$SEENF"
