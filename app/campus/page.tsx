"use client";

import {
  useGetCampus,
  isStudentData,
  isTeacherData,
} from "@/features/campus/api/use-get-campus";
import { StudentView } from "./components/student-view";
import { TeacherView } from "./components/teacher-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampusPage() {
  const { data, isPending: isLoadingCampusData, error } = useGetCampus();

  const isPending = isLoadingCampusData

  if (isPending) {
    return <CampusLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Error al cargar
            </h2>
            <p className="text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (isStudentData(data)) {
    return <StudentView data={data} />;
  }

  if (isTeacherData(data)) {
    return <TeacherView data={data} />;
  }

  return null;
}

function CampusLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome section skeleton */}
      <Skeleton className="h-48 rounded-3xl" />

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      {/* Content section skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

