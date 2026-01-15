"use client";

import { useGetCampus, isAdminData } from "@/features/campus/api/use-get-campus";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CampusHeader } from "./components/campus-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isPending: isLoadingCampusData } = useGetCampus();
  const router = useRouter();

  const isPending = isLoadingCampusData

  useEffect(() => {
    if (data && isAdminData(data)) {
      router.replace(data.redirect);
    }
  }, [data, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-12 w-64" />
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-40 rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data || isAdminData(data)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <CampusHeader user={data.user} />
        <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}

