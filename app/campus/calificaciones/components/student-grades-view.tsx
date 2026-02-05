"use client"
import { GraduationCap, FileText, Award, TrendingUp } from "lucide-react"
import { useGetGrades } from "@/features/grades/api/use-get-grades"
import { GradesStatCard } from "@/features/grades/components/grades-stat-card"
import { GradesQuizzesSection } from "@/features/grades/components/grades-quizzes-section"
import { Skeleton } from "@/components/ui/skeleton"
import { GradesAssignmentsSection } from "@/features/assignment/components/grades-assignments-section"

export function StudentGradesView() {
  const { quizAttempts, assignmentSubmissions, isPending } = useGetGrades()

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-[300px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  const cuestionarios = (quizAttempts || [])
  const assignments = (assignmentSubmissions || [])

  const totalCuestionarios = cuestionarios.length
  const totalAssignments = assignments.filter((a) => a.grade !== null).length
  const averageQuizScore = totalCuestionarios > 0
    ? cuestionarios.reduce((sum, q) => sum + (q.score || 0), 0) / totalCuestionarios
    : 0
  const averageAssignmentScore = totalAssignments > 0
    ? assignments
      .filter((a) => a.grade !== null)
      .reduce((sum, a) => sum + (a.grade ?? 0), 0) / totalAssignments
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Mis Calificaciones
        </h1>
        <p className="text-muted-foreground text-lg">
          Visualiza tus calificaciones de Cuestionarios y entregas de tareas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GradesStatCard
          title="Cuestionarios Realizados"
          icon={<GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          value={totalCuestionarios}
        />
        <GradesStatCard
          title="Tareas Calificadas"
          icon={<FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
          value={totalAssignments}
        />
        <GradesStatCard
          title="Promedio Cuestionarios"
          icon={<TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          value={averageQuizScore.toFixed(1)}
        />
        <GradesStatCard
          title="Promedio Tareas"
          icon={<Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          value={averageAssignmentScore.toFixed(1)}
        />
      </div>

      <GradesQuizzesSection quizAttempts={quizAttempts} />
      <GradesAssignmentsSection assignmentSubmissions={assignmentSubmissions} />

    </div>
  )
}