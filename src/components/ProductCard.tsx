"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ShoppingCart, X, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OptimizedProductImage } from "@/components/OptimizedProductImage";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export function ProductCard({
  product,
  isSelected,
  onSelect,
  className,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-none shadow-lg",
        "transition-all duration-500 ease-out",
        "hover:shadow-xl hover:shadow-[#e2b3f7]/10 hover:-translate-y-1",
        isSelected ? "ring-2 ring-[#0072BB]" : "",
        className
      )}
    >
      {/* Badge "Sélectionné" */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#0072BB] to-[#0086D8] text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          <span>Sélectionné</span>
        </div>
      )}

      {/* Badge "Stock" */}
      {product.stock !== undefined && (
        <div
          className={cn(
            "absolute top-3 left-3 z-10 text-xs font-semibold px-1.5 py-1 rounded-full shadow-sm flex items-center gap-1",
            product.stock > 5
              ? "bg-green-500 text-black"
              : product.stock > 0
              ? "bg-yellow-500 text-black"
              : "bg-red-500 text-black"
          )}
        >
          {product.stock > 5 ? (
            <span>En stock</span>
          ) : product.stock > 0 ? (
            <span>Stock limité</span>
          ) : (
            <span>Épuisé</span>
          )}
        </div>
      )}

      {/* Image du produit */}
      <div className="relative aspect-square overflow-hidden">
        <OptimizedProductImage
          src={product.image}
          alt={product.name}
          className={cn(
            "group-hover:scale-[1.03] group-hover:brightness-[1.03]",
            product.stock === 0 && "opacity-70 grayscale"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={75}
          placeholder="empty"
        />
      </div>

      {/* Contenu du produit */}
      <div className="p-4 flex flex-col min-h-[200px]">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
          {product.name}
        </h3>

        <div 
          className={cn(
            "text-sm text-gray-600 dark:text-gray-300",
            !isExpanded && "line-clamp-3"
          )}
        >
          {product.description}
        </div>

        {product.description && product.description.length > 150 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-[#0072BB] text-sm mt-2 flex items-center hover:underline"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Voir plus
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="text-lg font-bold bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] bg-clip-text text-transparent">
            {product.price}
          </span>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all duration-300 ease-in-out transform hover:scale-[1.02]",
              isSelected
                ? "bg-gradient-to-r from-[#0072BB] to-[#0086D8] text-white hover:shadow-[#0086D8]/20 hover:shadow-md"
                : product.stock === 0
                ? "border-red-300 text-red-400"
                : "border-[#0072BB] text-[#0072BB] hover:bg-[#0072BB]/10"
            )}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Sélectionné
              </>
            ) : product.stock === 0 ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Commander
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Ajouter
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
