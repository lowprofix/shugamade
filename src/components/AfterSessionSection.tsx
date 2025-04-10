"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { afterSessionRecommendations, postSessionAdvice } from "@/lib/data";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function AfterSessionSection() {
  return (
    <section id="afterSession" className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 relative">
          {/* Étoile au-dessus du titre */}
          <div className="absolute -top-4 left-[calc(50%+80px)] text-brand-blue-light animate-pulse">
            <Sparkles size={24} />
          </div>

          <h2 className="mb-6 text-3xl md:text-4xl font-bold relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end relative">
              Conseils
              {/* Petite étoile décorative */}
              <svg
                className="absolute -top-4 -left-8 w-5 h-5 text-brand-blue-dark animate-spin-slow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </span>{" "}
            <span className="text-pink-400">Post-Séance</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Pour maximiser les résultats de votre traitement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Conseils pour les soins à domicile */}
          <Card className="border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-white">
              <CardTitle className="text-xl font-medium text-gray-800 flex items-center">
                <span className="bg-teal-400 text-white rounded-full px-4 py-1 text-sm mr-3">
                  Soins à Domicile
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {postSessionAdvice.homecare.map((advice, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="text-teal-400 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span className="text-gray-700">{advice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommandations après la séance */}
          <Card className="border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 bg-gradient-to-r from-pink-50 to-white">
              <CardTitle className="text-xl font-medium text-gray-800 flex items-center">
                <span className="bg-pink-400 text-white rounded-full px-4 py-1 text-sm mr-3">
                  Recommandations
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {afterSessionRecommendations.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="text-pink-400 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span className="text-gray-700">{precaution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
