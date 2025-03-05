"use client";

import { Star } from "@/components/Star";
import { TestimonialCard } from "@/components/TestimonialCard";
import { testimonials } from "@/lib/data";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-12 bg-gradient-to-r from-teal-50 to-pink-50 relative"
    >
      {/* Étoiles décoratives */}
      <div className="absolute top-10 left-10 hidden md:block">
        <Star size={65} rotation={-5} />
      </div>
      <div className="absolute bottom-10 right-10 hidden md:block">
        <Star size={55} rotation={10} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          {/* Étoile au-dessus du titre */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <Star size={40} rotation={15} />
          </div>

          <h2 className="text-3xl font-light text-gray-800">
            <span className="text-pink-400">Témoignages</span>{" "}
            <span className="text-teal-400">clients</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Découvrez les résultats et l'expérience de nos clients satisfaits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
