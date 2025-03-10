/**
 * Types pour l'application ShugaMade
 */

export interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
  calLink: string;
  description?: string;
  isPromo?: boolean;
  color?: "teal" | "pink" | "brand";
  includes?: string[];
  eventTypeId?: number;
  durationMinutes?: number;
}

export interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  image?: string;
}

/**
 * Données pour les services proposés
 */
export const services: Service[] = [
  {
    id: 1,
    name: "Diagnostic capillaire",
    price: "10 000 FCFA",
    duration: "30 min",
    calLink: "mbote-bio-oabi4t/diagnostic-capillaire",
    description:
      "Évaluation complète de votre cuir chevelu et diagnostic personnalisé pour déterminer le traitement adapté.",
    color: "brand",
    includes: [
      "Analyse du cuir chevelu",
      "Évaluation de la densité capillaire",
      "Recommandations personnalisées",
    ],
  },
  {
    id: 2,
    name: "Hairneedling - Tempes",
    price: "35 000 FCFA",
    duration: "45 min",
    calLink: "mbote-bio-oabi4t/hairneedling-tempes",
    description:
      "Traitement spécifique pour les zones temporales avec notre technique de micro-needling et sérums naturels.",
    color: "pink",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par micro-needling",
      "Application de sérums naturels",
    ],
  },
  {
    id: 3,
    name: "Hairneedling - Tête entière",
    price: "45 000 FCFA",
    duration: "60 min",
    calLink: "mbote-bio-oabi4t/hairneedling-tete-entiere",
    description:
      "Traitement complet du cuir chevelu pour stimuler la repousse et renforcer les follicules pileux.",
    color: "teal",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par micro-needling",
      "Application de sérums naturels",
      "Stimulation de la repousse capillaire",
    ],
  },
];

/**
 * Données pour les forfaits promotionnels
 */
export const promoServices: Service[] = [
  {
    id: 4,
    name: "Promo 4 séances - Tempes",
    price: "135 000 FCFA",
    duration: "4 x 45 min",
    calLink: "mbote-bio-oabi4t/pack-promo-hairneedling-tempes-4-seances",
    isPromo: true,
    color: "pink",
  },
  {
    id: 5,
    name: "Promo 4 séances - Tête entière",
    price: "175 000 FCFA",
    duration: "4 x 60 min",
    calLink: "mbote-bio-oabi4t/pack-promo-hairneedling-tete-entiere-4-seances",
    isPromo: true,
    color: "pink",
  },
  {
    id: 6,
    name: "Promo 6 séances - Tempes",
    price: "190 000 FCFA",
    duration: "6 x 45 min",
    calLink: "mbote-bio-oabi4t/pack-promo-hairneedling-tempes-6-seances",
    isPromo: true,
    color: "teal",
  },
  {
    id: 7,
    name: "Promo 6 séances - Tête entière",
    price: "250 000 FCFA",
    duration: "6 x 60 min",
    calLink: "mbote-bio-oabi4t/pack-promo-hairneedling-tete-entiere-6-seances",
    isPromo: true,
    color: "teal",
  },
];

/**
 * Données pour les forfaits regroupés
 */
export const promoPackages = [
  {
    id: 1,
    name: "Promo 4 séances",
    isRecommended: true,
    color: "pink",
    options: [
      { name: "Tempes", price: "135 000 FCFA" },
      { name: "Tête entière", price: "175 000 FCFA" },
    ],
    benefits: ["Kit SHUGAMADE offert (valeur 22 500 FCFA)"],
  },
  {
    id: 2,
    name: "Promo 6 séances",
    color: "teal",
    options: [
      { name: "Tempes", price: "190 000 FCFA" },
      { name: "Tête entière", price: "250 000 FCFA" },
    ],
    benefits: ["Kit SHUGAMADE offert (valeur 22 500 FCFA)"],
  },
];

/**
 * Données pour les témoignages
 */
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Marie K.",
    text: "Après 4 séances, j'ai constaté une nette amélioration de mes tempes. Les produits naturels sont vraiment efficaces !",
    rating: 5,
  },
  {
    id: 2,
    name: "Pascal D.",
    text: "Le diagnostic capillaire a été très instructif. L'équipe m'a donné des conseils personnalisés pour mon type de cheveux.",
    rating: 5,
  },
  {
    id: 3,
    name: "Carine M.",
    text: "Grâce au traitement complet, mes cheveux ont retrouvé leur densité. Je recommande vivement !",
    rating: 4,
  },
];

/**
 * Contenu du kit offert
 */
export const kitItems = [
  "Spray Coup de pep's",
  "Sérum Coup de pousse",
  "Derma roller professionnel",
];

/**
 * Informations de contact
 */
export const contactInfo = {
  phone: "+242 06 536 67 16",
  email: "contact@shugamade.com",
  address:
    "Institut ShugaMade, 119 Rue Bangalas, Poto-Poto, Brazzaville, Congo",
};
