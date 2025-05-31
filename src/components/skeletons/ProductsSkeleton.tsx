"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ProductsSkeleton() {
  return (
    <div className="space-y-12">
      {/* Skeleton pour les onglets de catégorie */}
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>

      {/* Skeleton pour la grille de produits */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Composant skeleton pour une carte produit individuelle
function ProductCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden border-none shadow-lg animate-pulse">
      {/* Skeleton pour l'image du produit */}
      <div className="relative aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700">
        {/* Badge stock skeleton */}
        <div className="absolute top-3 left-3 z-10">
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* Skeleton pour le contenu du produit */}
      <div className="p-4 flex flex-col min-h-[200px]">
        {/* Titre du produit */}
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>

        {/* Description du produit */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Bouton "Voir plus" skeleton */}
        <div className="flex items-center mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-1"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Prix et bouton d'action */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="h-6 w-24 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded"></div>
          <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </Card>
  );
} 