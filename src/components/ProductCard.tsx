"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export function ProductCard({ product, isSelected, onSelect, className }: ProductCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl h-full",
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
      
      {/* Image du produit */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-[#e2b3f7]/5 to-[#bfe0fb]/5">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {/* Contenu du produit */}
      <div className="p-5">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
          {product.name}
        </h3>
        
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          {product.description}
        </p>
        
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
              "transition-all",
              isSelected 
                ? "bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] text-white hover:shadow-[#9deaff]/20 hover:shadow-md" 
                : "border-[#bfe0fb] text-[#bfe0fb] hover:bg-[#bfe0fb]/10"
            )}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Sélectionné
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
