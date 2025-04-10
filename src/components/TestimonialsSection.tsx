"use client";

import { TestimonialCard } from "@/components/TestimonialCard";
import { testimonials } from "@/lib/data";
import { Sparkles } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-12 bg-gradient-to-r from-teal-50 to-pink-50"
    >
      {/* Étoiles décoratives */}
      <div className="absolute hidden top-10 left-10 md:block"></div>
      <div className="absolute hidden bottom-10 right-10 md:block"></div>

      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="relative mb-12 text-center">
          {/* Étoile au-dessus du titre */}
          <div className="absolute -top-8 right-[calc(50%-80px)] text-brand-pink-dark animate-pulse">
            <Sparkles size={24} />
          </div>

          <h2 className="mb-6 text-3xl md:text-4xl font-bold relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end relative">
              Témoignages
              {/* Petite étoile décorative */}
              <svg
                className="absolute -top-5 -left-6 w-5 h-5 text-brand-pink-dark animate-spin-slow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </span>{" "}
            <span className="text-teal-400">clients</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-3 text-gray-600">
            Découvrez les résultats et l'expérience de nos clients satisfaits
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
