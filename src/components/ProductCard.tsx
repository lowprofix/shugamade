"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ShoppingCart, X } from "lucide-react";
import { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-none shadow-lg h-full",
        "transition-all duration-500 ease-out",
        "hover:shadow-xl hover:shadow-[#e2b3f7]/10 hover:-translate-y-1",
        isSelected ? "ring-2 ring-[#bfe0fb]" : "",
        className
      )}
      onClick={onSelect}
    >
      {/* Badge "Sélectionné" */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
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
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-[#e2b3f7]/5 to-[#bfe0fb]/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-[1.03]",
            product.stock === 0 && "opacity-70 grayscale"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Contenu du produit */}
      <div className="p-5 transition-all duration-500 group-hover:bg-gradient-to-br from-transparent to-[#e2b3f7]/5">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
          {product.name}
        </h3>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {product.description}
        </div>

        <div className="flex items-center justify-between mt-auto">
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
                ? "bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] text-white hover:shadow-[#9deaff]/20 hover:shadow-md"
                : product.stock === 0
                ? "border-red-300 text-red-400"
                : "border-[#bfe0fb] text-[#bfe0fb] hover:bg-[#bfe0fb]/10"
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
