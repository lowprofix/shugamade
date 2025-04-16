"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      
      <div className="p-4 border rounded-lg">
        <div className="flex items-start">
          <Skeleton className="h-5 w-5 mr-2 flex-shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendrier */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="border rounded-lg p-4">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={`day-${i}`} className="h-5 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={`date-${i}`} className="h-9 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sélection d'horaire */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="p-6 border rounded-lg">
            <Skeleton className="h-5 w-48 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={`slot-${i}`} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
