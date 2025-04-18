import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Shugamade",
  description:
    "Notre politique de confidentialité définit comment nous collectons, utilisons et protégeons vos données personnelles.",
};

export default function PolitiqueConfidentialite() {
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
        Politique de Confidentialité
      </h1>

      <div className="prose dark:prose-invert prose-lg max-w-none">
        <p className="text-gray-600 dark:text-gray-300">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <h2>1. Introduction</h2>
        <p>
          Chez Shugamade, nous accordons une grande importance à la protection
          de votre vie privée. Cette politique de confidentialité explique
          comment nous collectons, utilisons, divulguons et protégeons vos
          informations lorsque vous utilisez notre site web et nos services.
        </p>

        <h2>2. Informations que nous collectons</h2>
        <p>Nous pouvons collecter les types d'informations suivants :</p>
        <ul>
          <li>
            <strong>Informations personnelles</strong> : nom, adresse e-mail,
            numéro de téléphone, que vous nous fournissez lors de la prise de
            rendez-vous.
          </li>
          <li>
            <strong>Informations de santé</strong> : des informations concernant
            votre état capillaire afin de vous offrir les services les plus
            adaptés.
          </li>
          <li>
            <strong>Informations d'utilisation</strong> : données sur la façon
            dont vous utilisez notre site web, collectées automatiquement via
            des cookies et technologies similaires.
          </li>
        </ul>

        <h2>3. Comment nous utilisons vos informations</h2>
        <p>Nous utilisons vos informations personnelles pour :</p>
        <ul>
          <li>Fournir, maintenir et améliorer nos services</li>
          <li>Traiter vos réservations et paiements</li>
          <li>
            Vous envoyer des communications relatives à votre rendez-vous ou à
            nos services
          </li>
          <li>
            Vous envoyer, avec votre consentement, des informations marketing
          </li>
          <li>Améliorer notre site web et personnaliser votre expérience</li>
        </ul>

        <h2>4. Partage de vos informations</h2>
        <p>
          Nous ne vendons pas vos données personnelles. Nous pouvons partager
          vos informations avec :
        </p>
        <ul>
          <li>
            Des prestataires de services qui nous aident à fournir nos services
          </li>
          <li>Des autorités légales lorsque la loi l'exige</li>
        </ul>

        <h2>5. Cookies et technologies similaires</h2>
        <p>
          Nous utilisons des cookies et des technologies similaires pour
          améliorer votre expérience, analyser l'utilisation du site et
          personnaliser le contenu. Vous pouvez gérer vos préférences en matière
          de cookies via les paramètres de votre navigateur.
        </p>

        <h2>6. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données personnelles</li>
          <li>Droit de rectification des données inexactes</li>
          <li>Droit à l'effacement de vos données</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité des données</li>
          <li>Droit d'opposition au traitement</li>
          <li>Droit de retirer votre consentement à tout moment</li>
        </ul>

        <h2>7. Sécurité des données</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité techniques et
          organisationnelles appropriées pour protéger vos données personnelles
          contre la perte, l'utilisation abusive ou l'altération.
        </p>

        <h2>8. Conservation des données</h2>
        <p>
          Nous conservons vos données personnelles aussi longtemps que
          nécessaire pour fournir nos services et respecter nos obligations
          légales. La durée de conservation varie selon le type d'informations.
        </p>

        <h2>9. Enfants</h2>
        <p>
          Nos services ne s'adressent pas aux enfants de moins de 16 ans. Nous
          ne collectons pas sciemment des informations personnelles d'enfants de
          moins de 16 ans.
        </p>

        <h2>10. Modifications de cette politique</h2>
        <p>
          Nous pouvons mettre à jour cette politique de confidentialité de temps
          à autre. Les modifications seront publiées sur cette page avec une
          date de mise à jour.
        </p>

        <h2>11. Nous contacter</h2>
        <p>
          Si vous avez des questions concernant cette politique de
          confidentialité, vous pouvez nous contacter à :
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
