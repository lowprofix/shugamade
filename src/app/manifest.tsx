export default function manifest() {
  return {
    name: 'Shugamade - Spécialiste des traitement capillaire naturel',
    short_name: 'Shugamade',
    description: 'Traitements capillaires naturels et soins spécialisés',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#bfe0fb',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}