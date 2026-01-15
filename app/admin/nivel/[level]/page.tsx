"use client"
import { useParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { useGetYearDetails } from "@/features/year/api/use-get-year-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { YearStats } from "./components/year-stats"
import { YearCourses } from "./components/year-courses"
import { YearTeachers } from "./components/year-teachers"
import { YearSubjects } from "./components/year-subjects"
import { YearStudents } from "./components/year-students"

export default function YearDetailsPage() {
  const params = useParams()
  const level = parseInt(params.level as string)

  const { yearDetails, isPending, error } = useGetYearDetails(level)

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

  if (!yearDetails) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No encontrado</AlertTitle>
          <AlertDescription>No se encontró información para este año escolar</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { year } = yearDetails

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{year.name}</h1>
        {year.description && (
          <p className="text-muted-foreground mt-2">{year.description}</p>
        )}
      </div>

      <YearStats year={year} />

      <YearStudents year={year} />

      <YearTeachers year={year} />

      <YearCourses year={year} />

      <YearSubjects year={year} />
    </div>
  )
}

