// Script pour ajouter les images de fond aux cards continents
// Peut être injecté sur n'importe quelle page qui affiche l'interface de map

const CONTINENT_IMAGES = {
  'EUROPE': '../../assets/images/destination/Europe.avif',
  'ASIE': '../../assets/images/destination/asie.avif',
  'MOYEN-ORIENT': '../../assets/images/destination/africa.avif', // À corriger avec une vraie image Moyen-Orient
  'OCÉANIE': '../../assets/images/destination/oceanie.avif',
  'AMÉRIQUES': '../../assets/images/destination/america.avif',
  'AFRIQUE': '../../assets/images/destination/africa.avif'
};

function enhanceContinentCards() {
  // Chercher toutes les cards de continents (selon plusieurs sélecteurs possibles)
  const cards = document.querySelectorAll('[data-continent], .continent-card, .map-interface__continent-tab');

  cards.forEach(card => {
    // Récupérer le nom du continent depuis le texte ou l'attribut data
    const continentName = card.dataset.continent
      || card.textContent.trim().toUpperCase()
      || card.querySelector('span')?.textContent.trim().toUpperCase();

    if (continentName && CONTINENT_IMAGES[continentName]) {
      // Appliquer l'image de fond
      card.style.backgroundImage = `url('${CONTINENT_IMAGES[continentName]}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';

      // Ajouter un overlay sombre pour la lisibilité
      if (!card.querySelector('.continent-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'continent-overlay';
        overlay.style.cssText = `
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.1) 100%);
          pointer-events: none;
          transition: opacity 0.2s;
        `;
        card.style.position = 'relative';
        card.insertBefore(overlay, card.firstChild);

        // Effet hover sur l'overlay
        card.addEventListener('mouseenter', () => {
          overlay.style.opacity = '0.8';
        });
        card.addEventListener('mouseleave', () => {
          overlay.style.opacity = '1';
        });
      }

      // S'assurer que le texte est lisible
      const textElement = card.querySelector('span') || card;
      textElement.style.position = 'relative';
      textElement.style.zIndex = '1';
      textElement.style.color = '#fff';
      textElement.style.textShadow = '0 1px 4px rgba(0, 0, 0, 0.8)';
    }
  });

  console.log('✅ Continent cards enhanced with images');
}

// Observer pour détecter quand l'interface de map apparaît
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      // Chercher si des cards de continents ont été ajoutées
      const hasNewCards = Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === 1) { // Element node
          return node.matches('[data-continent], .continent-card, .map-interface__continent-tab') ||
                 node.querySelector('[data-continent], .continent-card, .map-interface__continent-tab');
        }
        return false;
      });

      if (hasNewCards) {
        setTimeout(enhanceContinentCards, 100);
      }
    }
  });
});

// Démarrer l'observation du DOM
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Appliquer immédiatement si les cards existent déjà
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceContinentCards);
} else {
  enhanceContinentCards();
}

// Ré-appliquer après un court délai pour attraper les éléments chargés dynamiquement
setTimeout(enhanceContinentCards, 500);
setTimeout(enhanceContinentCards, 1000);
