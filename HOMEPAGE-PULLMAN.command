#!/bin/bash
# Script de lancement - Homepage Pullman
# Double-cliquer sur ce fichier pour ouvrir la page

PROJECT_DIR="/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2"
PORT=8000

echo "🚀 Lancement de la homepage Pullman..."
echo ""

# Vérifier si le serveur tourne déjà
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Serveur HTTP déjà actif sur le port $PORT"
else
    echo "🔧 Démarrage du serveur HTTP..."
    cd "$PROJECT_DIR"
    python3 -m http.server $PORT > /dev/null 2>&1 &
    sleep 2
    echo "✅ Serveur HTTP démarré"
fi

echo ""
echo "🌐 Ouverture de la page dans le navigateur..."
open "http://localhost:$PORT/pages/pullman/brand-homepage.html"

echo ""
echo "✅ Page ouverte !"
echo ""
echo "💡 Pour arrêter le serveur : lsof -ti :$PORT | xargs kill"
echo ""
echo "Vous pouvez fermer cette fenêtre."
