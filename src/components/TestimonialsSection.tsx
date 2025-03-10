"use client";

import { TestimonialCard } from "@/components/TestimonialCard";
import { testimonials } from "@/lib/data";

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
          <div className="absolute transform -translate-x-1/2 -top-10 left-1/2"></div>

          <h2 className="text-3xl font-light text-gray-800">
            <span className="text-pink-400">Témoignages</span>{" "}
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
