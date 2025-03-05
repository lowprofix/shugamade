"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  scrollToSection: (sectionId: string) => void;
}

export default function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
    <section id="home" className="pt-24 pb-12">
      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row">
          <div className="mb-10 md:w-1/2 md:mb-0">
            <h1 className="mb-4 text-4xl font-light text-gray-800 md:text-5xl">
              <span className="text-brand-pink-dark">Ta beauté</span>{" "}
              <span className="text-brand-blue-dark">capillaire</span>, notre
              expertise
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Traitement naturel pour tout type d'alopécie de traction par des
              experts du soin capillaire
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
              <div className="absolute -right-4 -bottom-4 px-3 py-1 text-sm text-pink-500 bg-pink-50 rounded-full shadow-md">
                100% naturel
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
