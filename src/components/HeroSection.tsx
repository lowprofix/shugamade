"use client";

import { Star } from "@/components/Star";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  scrollToSection: (sectionId: string) => void;
}

export default function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
    <section id="home" className="overflow-hidden relative pt-24 pb-12">
      {/* Étoiles décoratives */}
      <div className="hidden absolute top-10 left-10 md:block">
        <Star size={60} rotation={15} />
      </div>
      <div className="hidden absolute right-10 bottom-20 md:block">
        <Star size={80} rotation={-10} />
      </div>

      <div className="relative px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row">
          <div className="relative mb-10 md:w-1/2 md:mb-0">
            {/* Étoile en haut à gauche du texte */}
            <div className="absolute -left-5 -top-10">
              <Star size={40} rotation={20} />
            </div>

            <h1 className="mb-4 text-4xl font-light text-gray-800 md:text-5xl">
              <span className="text-brand-pink-dark">Ta beauté</span> la{" "}
              <span className="text-brand-blue-dark">capillaire</span>, notre
              expertise
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Nous prenons en charge toutes les formes d'alopécie (traction,
              androgénétique, cicatricielle…) ainsi que divers problèmes
              capillaires: chute, sécheresse, eczéma, cuir chevelu irrité,
              pellicules… <br />
              <span className="text-brand-pink-dark">
                Grâce à un diagnostic personnalisé et un protocole sur-mesure,
                100% naturels
              </span>
            </p>
            <Button
              onClick={() => scrollToSection("booking")}
              className="text-white bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end hover:shadow-md"
              size="roundedLg"
            >
              <Calendar className="mr-2" size={20} />
              Prendre rendez-vous
            </Button>
          </div>
          <div className="flex relative justify-center md:w-1/2">
            {/* Étoile en haut à droite de l'image */}
            <div className="absolute -top-10 right-10">
              <Star size={50} rotation={-15} />
            </div>

            <div className="relative">
              <div className="overflow-hidden w-64 h-64 bg-gradient-to-r rounded-full border-4 border-white shadow-lg md:w-80 md:h-80 from-brand-gradient-start/20 to-brand-gradient-end/20">
                <Image
                  src="/images/hero-bg.jpg"
                  alt="ShugaMade"
                  width={320}
                  height={320}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex absolute -right-4 -bottom-4 items-center px-3 py-1 text-sm text-pink-500 bg-pink-50 rounded-full shadow-md">
                <Star size={20} className="mr-1" />
                100% naturel
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
