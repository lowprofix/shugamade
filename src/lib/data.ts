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

export interface PromoPackage {
  id: number;
  name: string;
  isRecommended?: boolean;
  color: "teal" | "pink" | "brand";
  options: { name: string; price: string; sessions: number }[];
  benefits: string[];
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
    id: 10,
    name: "Massage crânien",
    price: "5 000 FCFA",
    duration: "20 min",
    calLink: "mbote-bio-oabi4t/massage-cranien",
    description:
      "Massage relaxant du cuir chevelu pour stimuler la circulation sanguine et favoriser la santé capillaire.",
    color: "brand",
    includes: [
      "Massage du cuir chevelu",
      "Techniques de relaxation",
      "Application d'huiles essentielles",
    ],
  },
  {
    id: 8,
    name: "Machine électrothérapie",
    price: "10 000 FCFA",
    duration: "30 min",
    calLink: "mbote-bio-oabi4t/machine-electrotherapie",
    description:
      "Traitement par électrothérapie pour stimuler la circulation sanguine et favoriser la santé du cuir chevelu.",
    color: "pink",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par électrothérapie",
      "Application de sérums naturels",
    ],
  },
  {
    id: 9,
    name: "Machine luminothérapie",
    price: "10 000 FCFA",
    duration: "30 min",
    calLink: "mbote-bio-oabi4t/machine-luminotherapie",
    description:
      "Traitement par luminothérapie pour activer les cellules du cuir chevelu et favoriser la repousse.",
    color: "teal",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par luminothérapie",
      "Application de sérums naturels",
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
export const promoPackages: PromoPackage[] = [
  {
    id: 1,
    name: "Promo 4 séances",
    isRecommended: true,
    color: "pink",
    options: [
      { name: "Tempes", price: "135 000 FCFA", sessions: 4 },
      { name: "Tête entière", price: "175 000 FCFA", sessions: 4 },
    ],
    benefits: [
      "Diagnostic capillaire offert",
      "Kit SHUGAMADE offert (valeur 22 500 FCFA)",
    ],
  },
  {
    id: 2,
    name: "Promo 6 séances",
    color: "teal",
    options: [
      { name: "Tempes", price: "190 000 FCFA", sessions: 6 },
      { name: "Tête entière", price: "250 000 FCFA", sessions: 6 },
    ],
    benefits: [
      "Diagnostic capillaire offert",
      "Kit SHUGAMADE offert (valeur 22 500 FCFA)",
    ],
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
  "Diagnostic capillaire",
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

/**
 * Recommandations pour les traitements
 */
export const treatmentRecommendations = {
  sessionFrequency: "Il est recommandé de réaliser 4 à 6 séances (1 séance toutes les deux semaines pendant 2 à 3 mois). Des séances d'entretien peuvent être proposées pour maintenir les résultats.",
  kitContents: "Kit SHUGAMADE offert: Spray Coup de pep's, sérum Coup de pousse, derma roller",
};

/**
 * Conseils post-séance et suivi
 */
export const postSessionAdvice = {
  homecare: [
    "Ne pas laver les cheveux pendant 24 à 48 heures pour laisser agir les actifs.",
    "Éviter les coiffures serrées et produits agressifs pendant au moins 5 jours.",
    "Appliquer le sérum Coup de Pousse et le spray Coup de Pep's 24h après et 3 fois par semaine pour maximiser la repousse.",
    "Masser le cuir chevelu quotidiennement pour stimuler la circulation.",
    "Protéger le cuir chevelu du soleil et éviter les fortes chaleurs."
  ]
};

/**
 * Recommandations après la séance
 */
export const afterSessionRecommendations = {
  precautions: [
    "Ne pas toucher la zone traitée avec des mains non lavées.",
    "Éviter l'eau et les produits capillaires pendant 24 heures après la séance.",
    "Ne pas exposer la zone au soleil direct ou à la chaleur excessive (sèche-cheveux chaud, sauna, etc.) pendant 48 heures.",
    "Éviter la transpiration excessive (sport intensif, hammam, etc.) pendant 48 heures.",
    "Ne pas appliquer d'huiles essentielles, d'alcool ou de produits agressifs sur la zone traitée avant 72 heures.",
    "Hydrater la zone traitée avec un produit recommandé si besoin."
  ]
};

/**
 * Conditions de réservation
 */
export const bookingConditions = {
  preparation: "Cheveux propres : Avant votre séance, assurez-vous que vos cheveux, en particulier la zone à traiter, soient propres et exempts de tout produit (huiles, gels, crèmes, etc.).",
  deposit: "Acompte obligatoire : Un acompte de 5 000 FCFA est requis pour confirmer votre réservation, le MoMo est à faire sur le 06 597 56 23 ou le Airtel au 05 05 092 89 99. Sans cet acompte, la réservation ne sera pas prise en compte.",
  punctuality: "Ponctualité : Merci d'arriver à l'heure. Un retard de plus de 15 minutes peut entraîner l'annulation de la séance sans possibilité de remboursement de l'acompte.",
  cancellation: "Annulation et report : Toute annulation doit être signalée au moins 24h à l'avance. Au-delà de ce délai, l'acompte ne sera pas remboursé.",
  address: "Adresse: 119 RUE BANGALAS, POTO-POTO BRAZZAVILLE",
  understanding: "Nous comprenons que des imprévus peuvent arriver, mais afin de garantir un service de qualité à chacun, nous vous demandons de respecter ces conditions. Merci pour votre compréhension et votre confiance !"
};
