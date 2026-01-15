"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SubjectLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-r from-slate-300 to-slate-400 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6 bg-white/20" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-80 bg-white/20" />
                  <Skeleton className="h-6 w-40 bg-white/20" />
                </div>
              </div>
              <Skeleton className="h-20 w-[500px] bg-white/20" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-24 w-28 rounded-2xl bg-white/20" />
              <Skeleton className="h-24 w-28 rounded-2xl bg-white/20" />
              <Skeleton className="h-24 w-28 rounded-2xl bg-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Skeleton className="h-64 rounded-3xl bg-white/20" />
            <Skeleton className="h-64 rounded-3xl bg-white/20" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
