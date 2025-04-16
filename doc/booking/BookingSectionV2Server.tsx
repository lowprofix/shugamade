import { Suspense } from "react";
import { Service as ServiceType } from "@/lib/data";
import BookingSectionSkeleton from "@/components/skeletons/BookingSectionSkeleton";
import BookingClientWrapper from "./BookingClientWrapper";
import { Sparkles } from "lucide-react";

interface BookingSectionV2ServerProps {
  services: ServiceType[];
}

export default function BookingSectionV2Server({ services }: BookingSectionV2ServerProps) {
  return (
    <section
      id="booking"
      className="py-12 bg-gradient-to-b from-pink-50 to-teal-50"
    >
      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="relative mb-12 text-center">
          <div className="absolute -top-8 left-[calc(50%+60px)] text-brand-blue-dark">
            <Sparkles size={24} />
          </div>

          <h2 className="inline-block relative mb-6 text-3xl font-bold md:text-4xl">
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              Réservez
            </span>{" "}
            votre soin
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Choisissez votre service et trouvez un créneau qui vous convient
          </p>
        </div>

        <Suspense fallback={<BookingSectionSkeleton />}>
          <BookingClientWrapper services={services} />
        </Suspense>

        {/* Note sur le kit offert */}
        <div className="p-4 mx-auto mt-6 max-w-3xl bg-pink-50 rounded-lg border border-pink-100">
          <p className="flex items-start text-sm text-gray-700">
            <span className="mr-1 font-medium">Kit offert :</span> Produits de
            soins adaptés à votre traitement pour toute réservation d'un forfait.
          </p>
        </div>
      </div>
    </section>
  );
}
