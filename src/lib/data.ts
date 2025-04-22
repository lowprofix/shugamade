/**
 * Types pour l'application ShugaMade
 */

export interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
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

export interface Product {
  id: number;
  hiboutikId?: number; // ID du produit dans le système Hiboutik
  name: string;
  description: string;
  price: string;
  image: string;
  category?: string;
  stock?: number; // Quantité en stock
  isAvailable?: boolean; // Pour indiquer si le produit est disponible
}

/**
 * Données pour les services proposés
 */
export const services: Service[] = [
  {
    id: 1,
    name: "Diagnostic simple",
    price: "10 000 FCFA",
    duration: "30 min",
    description:
      "Évaluation complète de votre cuir chevelu et diagnostic personnalisé pour déterminer le traitement adapté.",
    color: "brand",
    includes: [
      "Analyse du cuir chevelu",
      "Évaluation de la densité capillaire",
      "Recommandations personnalisées",
    ],
    durationMinutes: 30,
  },
  {
    id: 11,
    name: "Diagnostic complet avec compte-rendu",
    price: "15 000 FCFA",
    duration: "45 min",
    description:
      "Évaluation approfondie de votre cuir chevelu avec analyse détaillée et rapport écrit personnalisé.",
    color: "brand",
    includes: [
      "Analyse complète du cuir chevelu",
      "Évaluation détaillée de la densité capillaire",
      "Rapport écrit personnalisé",
      "Plan de traitement sur mesure",
    ],
    durationMinutes: 45,
  },
  {
    id: 14,
    name: "Séance Boost",
    price: "20 000 FCFA",
    duration: "30 min",
    description:
      "La séance se compose de la luminothérapie de l'électrothérapie et du massage crânien.",
    color: "brand",
    includes: [
      "Application de sérums naturels",
      "Traitement par Luminothérapie",
      "Traitement par électrothérapie",
      "Massage crânien du cuir chevelu",
    ],
    durationMinutes: 30,
  },
  {
    id: 10,
    name: "Massage crânien",
    price: "5 000 FCFA",
    duration: "10 min",
    description:
      "Massage relaxant du cuir chevelu pour stimuler la circulation sanguine et favoriser la santé capillaire.",
    color: "brand",
    includes: [
      "Massage du cuir chevelu",
      "Techniques de relaxation",
      "Application d'huiles essentielles",
    ],
    durationMinutes: 10,
  },
  {
    id: 12,
    name: "Électrothérapie",
    price: "10 000 FCFA",
    duration: "10 min",
    description:
      "Traitement par électrothérapie pour stimuler la circulation sanguine et favoriser la santé du cuir chevelu.",
    color: "pink",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par électrothérapie",
      "Application de sérums naturels",
    ],
    durationMinutes: 10,
  },
  {
    id: 13,
    name: "Luminothérapie",
    price: "10 000 FCFA",
    duration: "20 min",
    description:
      "Traitement par luminothérapie pour activer les cellules du cuir chevelu et favoriser la repousse.",
    color: "teal",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par luminothérapie",
      "Application de sérums naturels",
    ],
    durationMinutes: 20,
  },
  {
    id: 2,
    name: "Hairneedling - Tempes",
    price: "35 000 FCFA",
    duration: "45 min",
    description:
      "Traitement spécifique pour les zones temporales avec notre technique de micro-needling et sérums naturels.",
    color: "pink",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par micro-needling",
      "Application de sérums naturels",
    ],
    durationMinutes: 45,
  },
  {
    id: 3,
    name: "Hairneedling - Tête entière",
    price: "45 000 FCFA",
    duration: "60 min",
    description:
      "Traitement complet du cuir chevelu pour stimuler la repousse et renforcer les follicules pileux.",
    color: "teal",
    includes: [
      "Préparation du cuir chevelu",
      "Traitement par micro-needling",
      "Application de sérums naturels",
      "Stimulation de la repousse capillaire",
    ],
    durationMinutes: 60,
  },
];

/**
 * Données pour les forfaits promotionnels
 */
export const promoServices: Service[] = [
  {
    id: 401,
    name: "Promo 4 séances - Tempes",
    price: "135 000 FCFA",
    duration: "4 x 45 min",
    isPromo: true,
    color: "pink",
    includes: [
      "4 séances de Hairneedling - Tempes",
      "Kit SHUGAMADE offert (valeur 12 500 FCFA)",
      "Diagnostic capillaire offert (valeur 10 000 FCFA)",
    ],
    durationMinutes: 45,
  },
  {
    id: 402,
    name: "Promo 4 séances - Tête entière",
    price: "175 000 FCFA",
    duration: "4 x 60 min",
    isPromo: true,
    color: "teal",
    includes: [
      "4 séances de Hairneedling - Tête entière",
      "Kit SHUGAMADE offert (valeur 12 500 FCFA)",
      "Diagnostic capillaire offert (valeur 10 000 FCFA)",
    ],
    durationMinutes: 60,
  },
  {
    id: 404,
    name: "Promo 6 séances - Tempes",
    price: "190 000 FCFA",
    duration: "6 x 45 min",
    isPromo: true,
    color: "pink",
    includes: [
      "6 séances de Hairneedling - Tempes",
      "Kit SHUGAMADE offert (valeur 12 500 FCFA)",
      "Diagnostic capillaire offert (valeur 10 000 FCFA)",
    ],
    durationMinutes: 45,
  },
  {
    id: 405,
    name: "Promo 6 séances - Tête entière",
    price: "250 000 FCFA",
    duration: "6 x 60 min",
    isPromo: true,
    color: "teal",
    includes: [
      "6 séances de Hairneedling - Tête entière",
      "Kit SHUGAMADE offert (valeur 12 500 FCFA)",
      "Diagnostic capillaire offert (valeur 10 000 FCFA)",
    ],
    durationMinutes: 60,
  },
];

/**
 * Données pour les forfaits regroupés
 */
export const promoPackages: PromoPackage[] = [
  {
    id: 101,
    name: "Promo 4 séances",
    isRecommended: true,
    color: "pink",
    options: [
      { name: "Tempes", price: "135 000 FCFA", sessions: 4 },
      { name: "Tête entière", price: "175 000 FCFA", sessions: 4 },
    ],
    benefits: [
      "Économisez jusqu'à 25% par rapport aux séances individuelles",
      "Kit SHUGAMADE offert (valeur 12 500 FCFA)",
      "Diagnostic capillaire offert (valeur 10 000 FCFA)",
      "Résultats optimaux avec un traitement complet",
      "Suivi personnalisé tout au long du traitement",
    ],
  },
  {
    id: 102,
    name: "Promo 6 séances",
    color: "teal",
    options: [
      { name: "Tempes", price: "190 000 FCFA", sessions: 6 },
      { name: "Tête entière", price: "250 000 FCFA", sessions: 6 },
    ],
    benefits: [
      "Économisez jusqu'à 35% par rapport aux séances individuelles",
      "Kit SHUGAMADE offert (valeur 12 500 FCFA)",
      "Diagnostic capillaire offert (valeur 10 000 FCFA)",
      "Résultats optimaux avec un traitement intensif",
      "Suivi personnalisé tout au long du traitement",
    ],
  },
];

/**
 * Données pour les témoignages
 */
export const testimonials: Testimonial[] = [
  {
    id: 201,
    name: "Aïcha B.",
    text: "Après 3 mois de traitement, j'ai constaté une repousse significative sur mes tempes. Je suis ravie !",
    rating: 5,
  },
  {
    id: 202,
    name: "Rosa A.",
    text: "Je souffrais de fortes pellicules qui rendaient mon quotidien très difficile. Depuis que j'ai commencé les séances Boost je n'ai plus aucune démangeaison ni pellicule, et mes cheveux repoussent visiblement. Un grand merci !",
    rating: 5,
  },
  {
    id: 203,
    name: "Marlène K.",
    text: "Le diagnostic capillaire a été très instructif. Les conseils personnalisés ont vraiment fait la différence.",
    rating: 5,
  },
];

/**
 * Données pour les produits proposés
 */
export const products: Product[] = [
  {
    id: 27,
    hiboutikId: 27,
    name: "Spray coup de pep's 100ml",
    description:
      "Un spray multi-action qui stimule la pousse, hydrate le cuir chevelu, apaise les irritations et lutte contre les pellicules et la chute. Idéal en soin quotidien ou avant un traitement capillaire. Pour un cuir chevelu sain, rééquilibré et plein d'énergie.\n\nComposition:\nAqua, Mentha Piperita Leaf Extract, Urtica Dioica Leaf Extract, Cassia alata Extract, Eugenia Caryophyllus Bud Extract, Glycerin, Rosmarinus Officinalis Leaf Oil, Mentha Piperita Oil, Benzyl Alcohol, Dehydroacetic Acid ",
    price: "2 500 FCFA",
    image: "/images/products/coup_peps_spray.PNG",
    stock: 10,
    isAvailable: true,
  },
  {
    id: 24,
    hiboutikId: 24,
    name: "Sérum coup de pousse 15ml",
    description:
      "Ce sérum précieux nourrit, renforce et revitalise les cheveux grâce à une synergie d'huiles végétales et essentielles. Il stimule la pousse, freine la chute, lutte contre l'alopécie et renforce les cheveux cassés ou abîmés.\n\nComposition:\nSeed Oil: Ricinus communis, Azadirachta indica, Simmondsia chinensis, Macadamia ternifolia, cannabis sativa, rosa rubiginosa, Brassica juncea, glycérin Rosmarinus officinalis Leaf Oil, Ocimum basilicum Oil, Mentha piperita Oil, Tocopheryl Acetate",
    price: "5 000 FCFA",
    image: "/images/products/coup_pousse.PNG",
    category: "oils",
    stock: 5,
    isAvailable: true,
  },
  {
    id: 28,
    hiboutikId: 28,
    name: "Sérum coup de pep's+ 15ml",
    description:
      "Stimule la pousse, renforce la fibre capillaire et réduit la chute grâce à une synergie d'actifs puissants. Texture légère, absorption rapide. Idéal en soin quotidien.\n\nComposition: \nMentha Piperita Leaf, Urtica Dioica Extract, Syzygium Aromaticum Flower Extract, Clerodendrum Splendens Extract, Aloe Barbadensis Leaf Juice, Panthenol, Niacinamide, CaffeineMethylsulfonylmethane, Sodium Hyaluronate, Panax Ginseng Root Extract, Pisum Sativum Sprout Extract, Acetyl Tetrapeptide-3, Biotinoyl Tripeptide-1, Rosmarinus, Officinalis Leaf Oil, Benzyl Alcohol",
    price: "5 000 FCFA",
    image: "/images/products/coup_peps_serum.PNG",
    category: "oils",
    stock: 3,
    isAvailable: true,
  },
  {
    id: 29,
    hiboutikId: 29,
    name: "Dermaroller 0,5mm",
    description:
      "Appareil de micro-needling pour stimuler la repousse capillaire.",
    price: "5 000 FCFA",
    image: "/images/products/dermaroller.PNG",
    category: "accessories",
    stock: 2,
    isAvailable: true,
  },
  {
    id: 301,
    hiboutikId: 301,
    name: "Oméga 3 EPH & DHA",
    description:
      "Complément alimentaire riche en acides gras essentiels pour nourrir les cheveux de l'intérieur.",
    price: "8 500 FCFA",
    image: "/images/products/omega3_epa_dha.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 302,
    hiboutikId: 302,
    name: "Saw palmetto",
    description:
      "Extrait naturel qui aide à réduire la chute des cheveux liée aux hormones.",
    price: "8 500 FCFA",
    image: "/images/products/saw_palmeto.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 303,
    hiboutikId: 16,
    name: "Pépins de courge",
    description:
      "Complément naturel riche en zinc et en fer pour renforcer les cheveux et stimuler leur croissance.",
    price: "8 500 FCFA",
    image: "/images/products/pepins_courge.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 304,
    hiboutikId: 18,
    name: "Collagène marin",
    description:
      "Protéine naturelle qui renforce la structure des cheveux et améliore leur élasticité.",
    price: "8 500 FCFA",
    image: "/images/products/collagene_marin.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 305,
    hiboutikId: 19,
    name: "Complexe cheveux",
    description:
      "Formule complète de vitamines et minéraux spécifiquement conçue pour la santé des cheveux.",
    price: "8 500 FCFA",
    image: "/images/products/complexe_cheveux.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 306,
    hiboutikId: 20,
    name: "Spiruline",
    description:
      "Super-aliment riche en protéines, fer et antioxydants pour des cheveux plus forts et plus brillants.",
    price: "8 500 FCFA",
    image: "/images/products/spiruline_bio.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 307,
    hiboutikId: 17,
    name: "Fer",
    description: "Complément alimentaire pour la santé des cheveux.",
    price: "8 500 FCFA",
    image: "/images/products/fer.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
  },
  {
    id: 308,
    hiboutikId: 53,
    name: "Ginseng rouge bio",
    description:
      "Le Ginseng rouge contient des nutriments connus pour leurs propriétés anti-fatigue et stimulantes.",
    price: "10 000 FCFA",
    image: "/images/products/ginseng.jpg",
    category: "supplements",
    stock: 1,
    isAvailable: true,
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
  email: "shugamadec@gmail.com",
  address:
    "Institut ShugaMade, 119 Rue Bangalas, Poto-Poto, Brazzaville, Congo",
};

/**
 * Recommandations pour les traitements
 */
export const treatmentRecommendations = {
  sessionFrequency:
    "Il est recommandé de réaliser 4 à 6 séances pour de meilleurs résultats.",
  kitContents:
    "Kit SHUGAMADE offert: Spray Coup de pep's, sérum Coup de pousse, derma roller",
};

/**
 * Conseils post-séance et suivi
 */
export const postSessionAdvice = {
  homecare: [
    "Ne pas laver les cheveux pendant 24 à 48 heures pour laisser agir les actifs.",
    "Éviter les coiffures serrées et produits agressifs pendant au moins 5 jours.",
    "Ne pas exposer la zone au soleil direct ou à la chaleur excessive (sèche-cheveux chaud, sauna, etc.) pendant 48 heures.",
    "Appliquer le sérum Coup de Pousse et le spray Coup de Pep's 24h après et 3 fois par semaine pour maximiser la repousse.",
    "Masser le cuir chevelu quotidiennement pour stimuler la circulation.",
    "Ne pas appliquer d'huiles essentielles, d'alcool ou de produits agressifs sur la zone traitée avant 72 heures.",
    "Protéger le cuir chevelu du soleil et éviter les fortes chaleurs.",
  ],
};

/**
 * Recommandations après la séance (conservé vide pour éviter les erreurs)
 */
export const afterSessionRecommendations = {
  precautions: [],
};

/**
 * Conditions de réservation
 */
export const bookingConditions = {
  preparation:
    "Cheveux propres : Avant votre séance, assurez-vous que vos cheveux, en particulier la zone à traiter, soient propres et exempts de tout produit (huiles, gels, crèmes, etc.).",
  deposit:
    "Acompte obligatoire : Un acompte de 5 000 FCFA est requis pour confirmer votre réservation, le MoMo est à faire sur le 06 597 56 23 ou le Airtel au 05 092 89 99. Sans cet acompte, la réservation ne sera pas prise en compte.",
  punctuality:
    "Ponctualité : Merci d'arriver à l'heure. Un retard de plus de 15 minutes peut entraîner l'annulation de la séance sans possibilité de remboursement de l'acompte.",
  cancellation:
    "Annulation et report : Toute annulation doit être signalée au moins 24h à l'avance. Au-delà de ce délai, l'acompte ne sera pas remboursé.",
  address: "Adresse: 119 RUE BANGALAS, POTO-POTO BRAZZAVILLE",
  understanding:
    "Nous comprenons que des imprévus peuvent arriver, mais afin de garantir un service de qualité à chacun, nous vous demandons de respecter ces conditions. Merci pour votre compréhension et votre confiance !",
};
