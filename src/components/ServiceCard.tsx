import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Service } from "@/lib/data";
import { ChevronRight, Clock } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden h-full border border-gray-100 transition-shadow hover:shadow-md hover:border-teal-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-gray-800">
          {service.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center mb-3 text-gray-500">
          <Clock size={16} className="mr-2 text-teal-400" />
          <span>{service.duration}</span>
        </div>

        {service.description && (
          <p className="mb-3 text-sm text-gray-600">{service.description}</p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {service.includes &&
            service.includes.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2 text-pink-400">•</span>
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-lg font-medium text-teal-600">
          {service.price}
        </span>
        <Button
          onClick={() => onSelect(service)}
          variant="outline"
          size="sm"
          className="text-pink-500 border-pink-100 hover:text-pink-600 hover:bg-pink-50"
        >
          Réserver
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
