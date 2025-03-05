"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  scrollToSection: (sectionId: string) => void;
}

// Composant étoile personnalisé
const Star = ({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

export default function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
    <section id="home" className="overflow-hidden relative pt-24 pb-12">
      {/* Étoiles décoratives en arrière-plan */}
      <div className="absolute left-10 top-20 opacity-20 transform rotate-12 text-brand-pink-light">
        <Star size={40} className="animate-spin-slow" />
      </div>
      <div className="absolute right-10 bottom-10 opacity-20 transform -rotate-12 text-brand-blue-light">
        <Star size={32} className="animate-spin-slow" />
      </div>
      <div className="absolute top-1/2 right-1/4 opacity-10 text-brand-pink-light">
        <Sparkles size={48} />
      </div>

      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row">
          <div className="relative mb-10 md:w-1/2 md:mb-0">
            <h1 className="relative mb-4 text-4xl font-light text-gray-800 md:text-5xl">
              <span className="inline-flex relative items-center font-medium text-brand-pink-dark">
                <Star className="mr-2 w-6 h-6 animate-pulse text-brand-pink-dark" />
                Ta beauté
                {/* Petite étoile scintillante */}
                <Sparkles className="absolute -right-2 -top-4 w-5 h-5 text-brand-pink" />
              </span>{" "}
              <span className="relative font-medium text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                capillaire
                {/* Petite étoile rotative */}
                <Star className="absolute -top-3 -right-6 w-4 h-4 text-brand-blue animate-spin-slow" />
              </span>
              , notre expertise
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Nous prenons en charge toutes les formes d'alopécie (traction,
              androgénétique, cicatricielle…) ainsi que divers problèmes
              capillaires: chute, sécheresse, eczéma, cuir chevelu irrité,
              pellicules… <br />
              <span className="font-medium text-brand-pink-dark">
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
          <div className="flex justify-center md:w-1/2">
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
                <Sparkles className="mr-1 w-3 h-3" />
                100% naturel
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
