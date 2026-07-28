#!/bin/bash
# Script de restauration de la version stable - Homepage Pullman
# Date backup : 2026-06-19 15:05:25

BACKUP_DIR="/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/backups/2026-06-19_15-05-25"
PROJECT_ROOT="/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2"

echo "🔄 Restauration de la version stable..."
echo ""

# Créer backup des fichiers actuels avant restauration
CURRENT_BACKUP="$PROJECT_ROOT/backups/pre-restore-$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$CURRENT_BACKUP"

echo "📦 Sauvegarde des fichiers actuels dans: $CURRENT_BACKUP"
cp "$PROJECT_ROOT/pages/pullman/brand-homepage.html" "$CURRENT_BACKUP/" 2>/dev/null
cp "$PROJECT_ROOT/core/styles/base.css" "$CURRENT_BACKUP/" 2>/dev/null
cp "$PROJECT_ROOT/brands/pullman/pullman.css" "$CURRENT_BACKUP/" 2>/dev/null
cp "$PROJECT_ROOT/core/components/components.js" "$CURRENT_BACKUP/" 2>/dev/null

echo ""
echo "✅ Restauration des fichiers stables..."

# Restaurer les fichiers
cp "$BACKUP_DIR/brand-homepage.html" "$PROJECT_ROOT/pages/pullman/"
cp "$BACKUP_DIR/base.css" "$PROJECT_ROOT/core/styles/"
cp "$BACKUP_DIR/pullman.css" "$PROJECT_ROOT/brands/pullman/"
cp "$BACKUP_DIR/components.js" "$PROJECT_ROOT/core/components/"

echo ""
echo "✅ Restauration terminée !"
echo ""
echo "📝 Pour visualiser la page :"
echo "   1. cd '$PROJECT_ROOT'"
echo "   2. python3 -m http.server 8000"
echo "   3. Ouvrir : http://localhost:8000/pages/pullman/brand-homepage.html"
echo ""
echo "💾 Backup des fichiers précédents : $CURRENT_BACKUP"
echo ""
