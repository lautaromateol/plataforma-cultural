"use client"

import { useGetUser } from "@/features/auth/api/use-get-user"
import { Skeleton } from "@/components/ui/skeleton"
import { StudentGradesView } from "./components/student-grades-view"
import { TeacherGradesView } from "./components/teacher-grades-view"

export default function GradesPage() {
  const { user, isPending } = useGetUser()

  if (isPending) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-10 w-[250px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar la información del usuario</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {user.role === "STUDENT" && <StudentGradesView />}
      {user.role === "TEACHER" && <TeacherGradesView />}
      {user.role === "ADMIN" && <TeacherGradesView />}
    </div>
  )
}
