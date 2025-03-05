import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Star } from "lucide-react";

interface PackageOption {
  name: string;
  price: string;
  sessions: number;
}

interface PromoPackageCardProps {
  id: number;
  name: string;
  options: PackageOption[];
  benefits: string[];
  isRecommended?: boolean;
  color?: "teal" | "pink";
  onSelect: (packageId: number, option: PackageOption) => void;
}

export function PromoPackageCard({
  id,
  name,
  options,
  benefits,
  isRecommended = false,
  color = "teal",
  onSelect,
}: PromoPackageCardProps) {
  const colorClass =
    color === "teal"
      ? "from-teal-50 to-white border-teal-100"
      : "from-pink-50 to-white border-pink-100";

  const accentColor = color === "teal" ? "text-teal-500" : "text-pink-500";

  return (
    <Card
      className={`bg-gradient-to-br ${colorClass} overflow-hidden shadow relative border-2 ${
        isRecommended ? "border-teal-300" : ""}`}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-medium text-white bg-teal-400 rounded-bl">
          Recommandé
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
          {isRecommended && (
            <Star
              className="mr-2 text-yellow-400"
              size={18}
              fill="currentColor"
            />
          )}
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          {options.map((option, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg border ${
                index === 0 && isRecommended
                  ? "border-teal-200 bg-teal-50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{option.name}</span>
                <span className={`font-semibold ${accentColor}`}>
                  {option.price}
                </span>
              </div>
              <p className="text-sm text-gray-600">{option.sessions} séances</p>
              <Button
                onClick={() => onSelect(id, option)}
                variant="outline"
                size="sm"
                className="text-pink-500 border-pink-100 hover:text-pink-600 hover:bg-pink-50"
              >
                Réserver ce forfait
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Inclus dans ce forfait :
          </h4>
          <ul className="space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className={`mr-2 mt-0.5 ${accentColor}`} size={14} />
                <span className="text-gray-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
