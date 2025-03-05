"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AboutSectionProps {
  scrollToBooking?: () => void;
}

export default function AboutSection({ scrollToBooking }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="py-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container px-4 mx-auto">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <h2 className="mb-6 text-3xl md:text-4xl">
            Notre approche{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              personnalisée
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
                    className="px-6 py-3 text-white rounded-full bg-brand hover:bg-brand/90"
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
