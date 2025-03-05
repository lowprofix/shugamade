import React from 'react';
import { Star } from 'lucide-react';
import { Testimonial } from '@/lib/data';
import { 
  Card, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              fill={i < testimonial.rating ? "#f59e0b" : "none"}
              stroke={i < testimonial.rating ? "#f59e0b" : "#d1d5db"}
              className="mr-1"
            />
          ))}
        </div>
        <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <p className="text-gray-800 font-medium">{testimonial.name}</p>
      </CardFooter>
    </Card>
  );
}
