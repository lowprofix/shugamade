// Ce script génère des images Open Graph statiques pour les miniatures WhatsApp
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Assurez-vous d'installer le package canvas avec: pnpm add -D canvas

// Créer le dossier meta s'il n'existe pas
const metaDir = path.join(__dirname, '../public/images/meta');
if (!fs.existsSync(metaDir)) {
  fs.mkdirSync(metaDir, { recursive: true });
}

// Fonction pour générer une image Open Graph
function generateOGImage(filename, title, subtitle) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fond dégradé
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#bfe0fb');
  gradient.addColorStop(1, '#9deaff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Titre
  ctx.font = 'bold 90px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, height / 2 - 30);

  // Sous-titre
  ctx.font = '36px Arial';
  ctx.fillText(subtitle, width / 2, height / 2 + 40);

  // Enregistrer l'image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(metaDir, filename), buffer);
  console.log(`Image générée: ${filename}`);
}

// Générer les images
generateOGImage('opengraph-image.jpg', 'Shugamade', 'Spécialiste des traitement capillaire naturel');
generateOGImage('twitter-image.jpg', 'Shugamade', 'Spécialiste des traitement capillaire naturel');

console.log('Génération des images terminée!');
