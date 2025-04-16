"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Skeleton className="h-6 w-6 mr-2" />
        <Skeleton className="h-6 w-64" />
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
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        
        <div className="flex items-center mt-4">
          <Skeleton className="h-5 w-5 mr-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        
        <div className="flex items-center mt-4">
          <Skeleton className="h-5 w-5 mr-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        
        <div className="pt-6">
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
