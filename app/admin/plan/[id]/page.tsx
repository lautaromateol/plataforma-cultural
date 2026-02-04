"use client"

import { useParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { useGetStudyPlanDetails } from "@/features/study-plan/api/use-get-study-plan-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PlanStats } from "./components/plan-stats"
import { PlanStudents } from "./components/plan-students"
import { PlanCourses } from "./components/plan-courses"
import { PlanSubjects } from "./components/plan-subjects"
import { PlanTeachers } from "./components/plan-teachers"

export default function StudyPlanDetailsPage() {
  const params = useParams()
  const planId = params.id as string

  const { studyPlan, isPending, error } = useGetStudyPlanDetails(planId)

  if (isPending) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!studyPlan) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No encontrado</AlertTitle>
          <AlertDescription>
            No se encontró información para este plan de estudio
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{studyPlan.name}</h1>
            <Badge variant={studyPlan.isActive ? "default" : "secondary"}>
              {studyPlan.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Código: {studyPlan.code} | Duración: {studyPlan.durationYears}{" "}
            {studyPlan.durationYears === 1 ? "año" : "años"}
          </p>
          {studyPlan.description && (
            <p className="text-muted-foreground mt-2">{studyPlan.description}</p>
          )}
          {studyPlan.targetAudience && (
            <p className="text-sm text-muted-foreground mt-1">
              Público objetivo: {studyPlan.targetAudience}
            </p>
          )}
        </div>
      </div>

      <PlanStats studyPlan={studyPlan} />

      <PlanStudents studyPlan={studyPlan} />

      <PlanCourses studyPlan={studyPlan} />

      <PlanSubjects studyPlan={studyPlan} />

      <PlanTeachers studyPlan={studyPlan} />
    </div>
  )
}
