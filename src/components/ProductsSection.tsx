"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, products } from "@/lib/data";
import { Sparkles, ShoppingCart, Check, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { contactInfo } from "@/lib/data";

interface ProductsSectionProps {
  scrollToContact?: () => void;
}

export default function ProductsSection({
  scrollToContact,
}: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Filtrer les produits par catégorie si une catégorie est sélectionnée
  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        // Logique de filtrage à implémenter si nécessaire
        return true;
      })
    : products;

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
      message += `- ${product.name} (${product.price})\n`;
    });
    
    message += "\nMerci de me contacter pour finaliser ma commande.";
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Générer le lien WhatsApp
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  return (
    <section id="products" className="relative py-12 bg-white">
      {/* Étoiles décoratives */}
      <div className="hidden absolute left-12 top-16 opacity-30 transform rotate-12 text-brand-teal md:block">
        <Sparkles size={28} />
      </div>
      <div className="hidden absolute right-16 bottom-24 opacity-20 transform -rotate-12 text-brand-pink-dark md:block">
        <Sparkles size={24} />
      </div>

      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="relative mb-12 text-center">
          {/* Étoile au-dessus du titre */}
          <div className="absolute -top-6 left-[calc(50%-100px)] text-brand-teal animate-pulse">
            <Sparkles size={24} />
          </div>

          <h2 className="inline-block relative mb-6 text-3xl font-bold md:text-4xl">
            Nos{" "}
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              produits
              {/* Petite étoile décorative */}
              <svg
                className="absolute -bottom-4 -right-6 w-5 h-5 text-brand-teal animate-spin-slow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Des produits naturels et efficaces pour prendre soin de vos cheveux au quotidien
          </p>
        </div>

        {/* Panier flottant */}
        {selectedProducts.length > 0 && (
          <div className="fixed right-4 bottom-4 z-40">
            <Button
              onClick={() => setShowCart(!showCart)}
              className="flex gap-2 items-center p-4 text-white bg-gradient-to-r rounded-full shadow-lg from-brand-gradient-start to-brand-gradient-end hover:opacity-90 animate-pulse-slow"
            >
              <ShoppingCart size={24} />
              <span className="flex justify-center items-center w-6 h-6 text-sm font-extrabold rounded-full border-2 text-brand-pink-dark border-brand-pink-dark">
                {selectedProducts.length}
              </span>
            </Button>
          </div>
        )}

        {/* Modal du panier */}
        {showCart && (
          <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Votre sélection</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </Button>
              </div>
              
              <div className="p-4">
                {selectedProducts.length === 0 ? (
                  <p className="py-4 text-center text-gray-500">Votre panier est vide</p>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.price}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductSelection(product)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button 
                    className="flex gap-2 justify-center items-center py-3 w-full font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart size={20} />
                    Commander via WhatsApp
                  </Button>
                </a>
                <p className="mt-2 text-xs text-center text-gray-500">
                  Vous serez redirigé vers WhatsApp pour finaliser votre commande
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={isProductSelected(product.id)}
              onSelect={() => toggleProductSelection(product)}
            />
          ))}
        </div>

        {/* Bouton de commande principal */}
        {selectedProducts.length > 0 && (
          <div className="flex justify-center mt-8">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button 
                className="flex gap-2 items-center px-6 py-3 font-medium text-white bg-green-600 rounded-md shadow-md hover:bg-green-700"
              >
                <ShoppingCart size={20} />
                Commander {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} via WhatsApp
              </Button>
            </a>
          </div>
        )}

        <div className="p-4 mt-8 bg-white rounded-lg border border-gray-100 shadow-sm">
          <p className="text-sm text-center text-gray-600">
            <span className="font-medium">Information importante :</span> Pour commander nos produits, sélectionnez-les et utilisez le bouton WhatsApp pour finaliser votre commande directement avec notre équipe.
          </p>
        </div>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <Card className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-teal-400 shadow-md' : 'hover:border-teal-200'}`} onClick={onSelect}>
      <div className="relative w-full h-48 bg-gray-100">
        <div className="flex absolute inset-0 justify-center items-center">
          <div className="text-gray-400">Image du produit</div>
        </div>
        
        <Image 
          src={product.image} 
          alt={product.name} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badge de sélection */}
        {isSelected && (
          <div className="absolute top-2 right-2 p-1 text-white bg-teal-500 rounded-full">
            <Check size={16} />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <h4 className="mb-2 font-medium text-gray-800">{product.name}</h4>
          <p className="flex-grow mb-4 text-sm text-gray-600">{product.description}</p>
          <div className="flex justify-between items-center mt-auto">
            <span className="font-semibold text-brand">{product.price}</span>
            <Button
              variant="outline"
              size="sm"
              className={isSelected 
                ? "text-teal-500 border-teal-200 hover:text-teal-600 hover:bg-teal-50" 
                : "text-pink-500 border-pink-100 hover:text-pink-600 hover:bg-pink-50"}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected ? "Sélectionné" : "Sélectionner"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
