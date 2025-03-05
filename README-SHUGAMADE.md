# ShugaMade - Page d'Accueil avec ShadcnUI

Ce projet est une page d'accueil pour ShugaMade, un service de soins capillaires spécialisé dans le traitement de l'alopécie de traction. La page est construite avec Next.js, TailwindCSS, ShadcnUI et intègre Cal.com pour la gestion des réservations.

## Architecture

### Structure des Données

Toutes les données de l'application sont centralisées dans `src/lib/data.ts`. Cela inclut :
- Les services proposés
- Les forfaits promotionnels
- Les témoignages clients
- Les informations de contact

### Composants UI

L'application utilise les composants ShadcnUI personnalisés :

- **Button** : Bouton avec plusieurs variantes de style
- **Card** : Cartes pour l'affichage des informations
- **Calendar** : Calendrier pour la sélection de dates

### Composants Métier

Nous avons développé plusieurs composants métier réutilisables :

- **ServiceCard** : Affiche les détails d'un service
- **PromoPackageCard** : Affiche les forfaits promotionnels
- **TestimonialCard** : Affiche les témoignages clients
- **CalendarEmbed** : Intègre le calendrier Cal.com
- **BookingSection** : Section complète de réservation
- **ShugaNavigation** : Navigation spécifique à ShugaMade
- **HeroSection** : Section d'en-tête
- **ServicesSection** : Liste des services
- **TestimonialsSection** : Témoignages clients
- **ContactSection** : Informations de contact
- **Footer** : Pied de page

## Intégration Cal.com

L'intégration avec Cal.com est gérée via `src/lib/calcom.ts` qui fournit :

- Configuration de base
- Fonctions utilitaires pour construire les liens
- Fonction d'initialisation

## Pages

- **shugamade/page.tsx** : Page d'accueil principale avec toutes les sections
- **calendar/page.tsx** : Page dédiée au calendrier avec options d'affichage

## Comment utiliser

1. Personnalisez les données dans `src/lib/data.ts`
2. Modifiez le nom d'utilisateur Cal.com dans `src/lib/calcom.ts`
3. Ajustez les couleurs et le style selon votre charte graphique

## Personnalisation

Vous pouvez personnaliser :

- Les couleurs principales (teal et pink) dans les composants
- Les textes et descriptions dans le fichier de données
- Les liens Cal.com pour chaque service

## Développement

Pour ajouter de nouveaux services ou fonctionnalités :

1. Ajoutez les données dans `src/lib/data.ts`
2. Créez ou modifiez les composants nécessaires
3. Intégrez les composants dans les sections appropriées

## Cal.com

L'intégration avec Cal.com permet aux utilisateurs de prendre rendez-vous directement depuis le site. Chaque service est lié à un type d'événement spécifique sur Cal.com.

---

Développé avec ❤️ pour ShugaMade
