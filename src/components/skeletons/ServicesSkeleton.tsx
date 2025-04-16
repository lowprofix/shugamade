"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Skeleton className="h-6 w-6 mr-2" />
        <Skeleton className="h-6 w-48" />
      </div>
      
      <div className="p-4 border rounded-lg">
        <div className="flex items-start">
          <Skeleton className="h-5 w-5 mr-2 flex-shrink-0" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
            <div className="flex justify-between items-center pt-3 border-t">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
