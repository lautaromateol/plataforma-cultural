"use client"
import { useParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { useGetLevelDetails } from "@/features/level/api/use-get-level-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LevelStats } from "./components/year-stats"
import { LevelCourses } from "./components/year-courses"
import { LevelTeachers } from "./components/year-teachers"
import { LevelSubjects } from "./components/year-subjects"
import { LevelStudents } from "./components/year-students"

export default function LevelDetailsPage() {
  const params = useParams()
  const levelId = params.level as string

  const { levelDetails, isPending, error } = useGetLevelDetails(levelId)

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

  if (!levelDetails) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No encontrado</AlertTitle>
          <AlertDescription>No se encontró información para este nivel</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { level } = levelDetails

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{level.name}</h1>
        {level.studyPlan && (
          <p className="text-muted-foreground mt-1">
            Plan: {level.studyPlan.name} ({level.studyPlan.code})
          </p>
        )}
        {level.description && (
          <p className="text-muted-foreground mt-2">{level.description}</p>
        )}
      </div>

      <LevelStats level={level} />

      <LevelStudents level={level} />

      <LevelTeachers level={level} />

      <LevelCourses level={level} />

      <LevelSubjects level={level} />
    </div>
  )
}
