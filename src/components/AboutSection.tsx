"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AboutSectionProps {
  scrollToBooking?: () => void;
}

export default function AboutSection({ scrollToBooking }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
    >
      {/* Étoiles décoratives */}
      <div className="absolute top-12 left-1/4 text-brand-pink-dark opacity-30 transform -rotate-12">
        <Sparkles size={32} />
      </div>
      <div className="absolute bottom-1/3 right-1/4 text-brand-teal opacity-20 transform rotate-12">
        <Sparkles size={24} />
      </div>

      <div className="container px-4 mx-auto">
        <div className="mx-auto mb-12 max-w-4xl text-center relative">
          {/* Étoile principale près du titre */}
          <div className="absolute -top-2 right-[calc(50%-120px)] text-brand-pink-dark animate-pulse">
            <Sparkles size={28} />
          </div>

          <h2 className="mb-6 text-3xl md:text-4xl font-bold relative inline-block">
            Notre approche{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end relative">
              personnalisée
              {/* Petite étoile décorative */}
              <svg
                className="absolute -top-4 -right-6 w-5 h-5 text-brand-pink-dark animate-spin-slow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </span>
          </h2>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="max-w-none prose prose-lg">
                <p className="mb-4 leading-relaxed text-gray-700">
                  Chez SHUGAMADE, nous prenons en charge toutes les formes
                  d'alopécie et les problèmes capillaires, quel que soit votre
                  type de cheveux. Grâce à un diagnostic approfondi et
                  personnalisé, nous identifions les causes de votre chute ou
                  déséquilibre capillaire et vous proposons un traitement adapté
                  à vos besoins spécifiques.
                </p>

                <p className="mb-4 leading-relaxed text-gray-700">
                  Nos protocoles combinent des techniques avancées, des soins
                  naturels et des appareils de pointe pour stimuler la repousse,
                  renforcer le cuir chevelu et restaurer la santé de vos
                  cheveux.
                </p>

                <p className="mb-6 leading-relaxed text-gray-700">
                  Parce que chaque chevelure est unique, nous mettons notre
                  expertise et nos solutions innovantes au service de votre
                  bien-être capillaire.
                </p>

                <div className="mt-8 text-center">
                  <Button
                    onClick={scrollToBooking}
                    className="px-6 py-3 text-white bg-brand hover:bg-brand/90 rounded-full"
                  >
                    Prenez rendez-vous dès aujourd'hui
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
