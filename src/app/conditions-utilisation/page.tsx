import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | Shugamade",
  description:
    "Nos conditions d'utilisation définissent les règles et modalités d'utilisation de notre service.",
};

export default function ConditionsUtilisation() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Conditions d'Utilisation
      </h1>

      <div className="prose dark:prose-invert prose-lg max-w-none">
        <p className="text-gray-600 dark:text-gray-300">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <h2>1. Acceptation des conditions</h2>
        <p>
          En accédant et en utilisant le site web de Shugamade, vous acceptez
          d'être lié par ces Conditions d'Utilisation. Si vous n'acceptez pas
          ces conditions, veuillez ne pas utiliser notre site.
        </p>

        <h2>2. Services proposés</h2>
        <p>
          Shugamade propose des services de soins capillaires spécialisés,
          notamment le diagnostic capillaire, le hairneedling,
          l'électrothérapie, la luminothérapie et le massage crânien. Notre site
          web vous permet de vous informer sur ces services et de prendre
          rendez-vous.
        </p>

        <h2>3. Rendez-vous et annulations</h2>
        <p>
          Lors de la prise de rendez-vous via notre site, vous vous engagez à :
        </p>
        <ul>
          <li>Fournir des informations exactes et à jour</li>
          <li>
            Vous présenter à l'heure convenue ou annuler au moins 24 heures à
            l'avance
          </li>
          <li>
            Respecter une annulation tardive ou absence non justifiée pourra
            entraîner des frais d'annulation
          </li>
        </ul>

        <h2>4. Compte utilisateur</h2>
        <p>
          La création d'un compte peut être nécessaire pour utiliser certaines
          fonctionnalités du site. Vous êtes responsable de maintenir la
          confidentialité de vos identifiants et de toutes les activités
          effectuées sous votre compte.
        </p>

        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le contenu du site, y compris les textes, graphiques, logos, images,
          vidéos et logiciels, est la propriété de Shugamade et est protégé par
          les lois sur la propriété intellectuelle. Vous ne pouvez pas
          reproduire, distribuer, modifier ou créer des œuvres dérivées de ce
          contenu sans notre autorisation écrite préalable.
        </p>

        <h2>6. Responsabilité et garanties</h2>
        <p>
          Bien que nous nous efforcions de fournir des informations précises et
          à jour sur notre site, nous ne pouvons garantir l'exactitude,
          l'exhaustivité ou la pertinence de ces informations. L'utilisation du
          site se fait à vos propres risques.
        </p>
        <p>
          Les résultats des soins capillaires peuvent varier d'une personne à
          l'autre et nous ne pouvons garantir des résultats spécifiques suite à
          l'utilisation de nos services.
        </p>

        <h2>7. Limitation de responsabilité</h2>
        <p>
          Dans toute la mesure permise par la loi, Shugamade ne sera pas
          responsable des dommages indirects, accessoires, spéciaux, consécutifs
          ou punitifs résultant de votre utilisation ou de votre incapacité à
          utiliser le site ou nos services.
        </p>

        <h2>8. Liens externes</h2>
        <p>
          Notre site peut contenir des liens vers des sites web tiers. Nous
          n'avons aucun contrôle sur le contenu de ces sites et ne sommes pas
          responsables de leur contenu ou de leurs pratiques de confidentialité.
        </p>

        <h2>9. Modifications des conditions</h2>
        <p>
          Nous nous réservons le droit de modifier ces conditions d'utilisation
          à tout moment. Les modifications entrent en vigueur dès leur
          publication sur le site. Il vous incombe de consulter régulièrement
          ces conditions.
        </p>

        <h2>10. Loi applicable et juridiction</h2>
        <p>
          Ces conditions sont régies par les lois françaises. Tout litige
          découlant de ces conditions sera soumis à la compétence exclusive des
          tribunaux français.
        </p>

        <h2>11. Nous contacter</h2>
        <p>
          Si vous avez des questions concernant ces conditions d'utilisation,
          vous pouvez nous contacter à :
        </p>
        <p>
          Email : contact@shugamade.com
          <br />
          Téléphone : +33 1 23 45 67 89
        </p>
      </div>
    </div>
  );
}
