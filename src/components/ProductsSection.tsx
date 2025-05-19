"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Sparkles, ShoppingCart, X, Info, Pill, Droplets } from "lucide-react";
import { Product } from "@/lib/types";
import { contactInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProductsSectionProps {
  scrollToSection: (sectionId: string) => void;
}

// Composant pour les formes décoratives
const DecorativeShape = ({
  className,
  color = "#e2b3f7",
}: {
  className: string;
  color?: string;
}) => (
  <div
    className={cn(
      "absolute rounded-full opacity-20 animate-pulse-slow blur-lg",
      className
    )}
    style={{ backgroundColor: color }}
  />
);

// Composant pour les onglets de catégorie
const CategoryTab = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
      isActive
        ? "bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 text-gray-800 dark:text-white border border-[#ffb2dd]/30"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    )}
  >
    <Icon
      className={cn("w-4 h-4", isActive ? "text-[#ffb2dd]" : "text-gray-400")}
    />
    <span className={isActive ? "font-medium" : ""}>{label}</span>
  </button>
);

export default function ProductsSection({
  scrollToSection,
}: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Nouveaux états pour gérer les produits avec stocks
  const [productsWithStock, setProductsWithStock] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catégories de produits
  const categories = [
    { id: "all", label: "Tous les produits", icon: Sparkles },
    { id: "supplements", label: "Compléments", icon: Pill },
    { id: "oils", label: "Huiles", icon: Droplets },
    { id: "accessories", label: "Accessoires", icon: ShoppingCart },
  ];

  // Fonction pour récupérer les données de stock
  const fetchProductsStock = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des produits: ${response.status}`
        );
      }

      const data = await response.json();
      setProductsWithStock(data.products);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      setError("Impossible de récupérer les informations des produits");
      setProductsWithStock([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données de stock au montage du composant
  useEffect(() => {
    fetchProductsStock();
  }, []);

  // Fonction modifiée pour utiliser les produits avec stock
  const getFilteredProducts = () => {
    const productsToFilter = productsWithStock;

    if (selectedCategory === "all") {
      return productsToFilter;
    }

    return productsToFilter.filter(
      (product) => product.category === selectedCategory
    );
  };

  // Vérifier si un produit est dans le panier
  const isProductSelected = (productId: number) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  // Ajouter ou retirer un produit du panier
  const toggleProductSelection = (product: Product) => {
    if (isProductSelected(product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  // Générer le lien WhatsApp avec les produits sélectionnés
  const generateWhatsAppLink = () => {
    // Formater le numéro de téléphone (supprimer les espaces et le +)
    const phoneNumber = contactInfo.phone.replace(/\s+/g, "").replace("+", "");

    // Créer le message avec les produits sélectionnés
    let message = "Bonjour, je souhaite commander les produits suivants :\n\n";

    selectedProducts.forEach((product) => {
      // Ajouter un indicateur de stock pour chaque produit
      const stockStatus =
        product.stock === 0
          ? " [RUPTURE DE STOCK]"
          : product.stock && product.stock <= 5
          ? " [STOCK LIMITÉ]"
          : "";

      message += `- ${product.name} (${product.price})${stockStatus}\n`;
    });

    message += "\nMerci de me contacter pour finaliser ma commande.";

    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);

    // Générer le lien WhatsApp
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  // Calculer le total du panier
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      // Extraire le prix numérique (supposant un format comme "8 500 FCFA")
      const priceString = product.price.replace(/[^\d]/g, "");
      const price = parseInt(priceString, 10);
      return total + price;
    }, 0);
  };

  // Formater le prix total
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  return (
    <section id="products" className="relative py-24 overflow-hidden">
      {/* Formes décoratives - positions ajustées pour ne pas toucher les bords */}
      <DecorativeShape className="w-72 h-72 right-10 top-40" color="#ffb2dd" />
      <DecorativeShape
        className="w-64 h-64 left-10 bottom-40"
        color="#e2b3f7"
      />
      <DecorativeShape
        className="w-48 h-48 right-1/4 bottom-20"
        color="#bfe0fb"
      />

      <div className="container relative z-10 px-2">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 border border-[#ffb2dd]/30">
            <Sparkles className="w-4 h-4 mr-2 text-[#ffb2dd]" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Nos produits capillaires
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Des{" "}
            <span className="bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] bg-clip-text text-transparent font-extrabold">
              produits
            </span>{" "}
            pour votre{" "}
            <span className="relative">
              routine
              <svg
                className="absolute bottom-0 left-0 w-full h-3 -z-10"
                viewBox="0 0 200 8"
              >
                <path
                  d="M0 4C40 0 60 8 200 4"
                  fill="none"
                  stroke="#bfe0fb"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Des produits naturels et efficaces pour prendre soin de vos cheveux
            au quotidien et compléter vos traitements en salon.
          </p>
        </div>

        {/* Onglets de catégorie */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <CategoryTab
              key={category.id}
              icon={category.icon}
              label={category.label}
              isActive={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </div>

        {/* Afficher un message d'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <p>{error}</p>
            <p className="text-sm mt-1">
              Les produits sont affichés sans informations de stock mises à
              jour.
            </p>
          </div>
        )}

        {/* Afficher un indicateur de chargement si nécessaire */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-700 dark:border-blue-300 mr-3"></div>
            <p>Mise à jour des informations de stock...</p>
          </div>
        )}

        {/* Grille de produits */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {getFilteredProducts().map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={isProductSelected(product.id)}
              onSelect={() => toggleProductSelection(product)}
              className="animate-fade-in h-full"
            />
          ))}
        </div>

        {/* Panier flottant */}
        {selectedProducts.length > 0 && (
          <div className="fixed right-4 bottom-4 z-40">
            <Button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2 p-3 rounded-full bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] text-white shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="flex items-center justify-center w-6 h-6 text-sm font-bold bg-white text-[#ffb2dd] rounded-full">
                {selectedProducts.length}
              </span>
            </Button>
          </div>
        )}

        {/* Dialog du panier */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Votre panier</DialogTitle>
            </DialogHeader>

            <div className="py-2">
              {selectedProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="relative w-16 h-16 overflow-hidden rounded-md bg-white">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {product.name}
                        </h4>
                        <p className="text-sm font-semibold text-[#ffb2dd]">
                          {product.price}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductSelection(product)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedProducts.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              {selectedProducts.length > 0 && (
                <>
                  <DialogClose asChild>
                    <Button variant="outline">Continuer mes achats</Button>
                  </DialogClose>

                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Commander via WhatsApp
                    </Button>
                  </a>
                </>
              )}

              {selectedProducts.length === 0 && (
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
              )}
            </DialogFooter>

            {selectedProducts.length > 0 && (
              <p className="mt-2 text-xs text-center text-gray-500">
                Vous serez redirigé vers WhatsApp pour finaliser votre commande
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* Bouton de commande principal (visible si des produits sont sélectionnés) */}
        {selectedProducts.length > 0 && (
          <div className="mt-12 text-center">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-6 h-auto text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Commander {selectedProducts.length} produit
                {selectedProducts.length > 1 ? "s" : ""} via WhatsApp
              </Button>
            </a>
          </div>
        )}

        {/* Note d'information */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-[#ffb2dd]/10 via-white to-[#e2b3f7]/10 dark:from-[#ffb2dd]/5 dark:via-gray-900 dark:to-[#e2b3f7]/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-[#ffb2dd]/10 shrink-0">
                <Info className="w-5 h-5 text-[#ffb2dd]" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Information importante
                </h3>
                <p className="text-gray-700 dark:text-gray-200">
                  Pour commander nos produits, sélectionnez-les et utilisez le
                  bouton WhatsApp pour finaliser votre commande directement avec
                  notre équipe. Nous vous contacterons pour confirmer votre
                  commande et organiser la livraison.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
