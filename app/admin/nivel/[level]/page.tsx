"use client"

import { useParams } from "next/navigation"
import { useGetYearDetails } from "@/features/year/api/use-get-year-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { YearStats } from "./components/year-stats"
import { YearCourses } from "./components/year-courses"
import { YearTeachers } from "./components/year-teachers"
import { YearSubjects } from "./components/year-subjects"
import { useGetTeachers } from "@/features/user/api/use-get-teachers"
import { useGetCourses } from "@/features/course/api/use-get-courses"
import { useGetSubjects } from "@/features/subject/api/use-get-subjects"
import { useGetStudents } from "@/features/user/api/use-get-students"
import { YearStudents } from "./components/year-students"

export default function YearDetailsPage() {
  const params = useParams()
  const level = parseInt(params.level as string)

  const { yearDetails, isPending, error } = useGetYearDetails(level)
  const { students, isPending: isStudentsPending, error: studentsError } = useGetStudents({ yearId: yearDetails?.year.id })
  const { teachers, isPending: isTeachersPending, error: teachersError } = useGetTeachers({ yearId: yearDetails?.year.id })
  const { courses, isPending: isCoursesPending, error: coursesError } = useGetCourses({ yearId: yearDetails?.year.id })
  const { subjects, isPending: isSubjectsPending, error: subjectsError } = useGetSubjects({ yearId: yearDetails?.year.id })

  const studentsData = { students, courses, isPending: isStudentsPending, error: studentsError }
  const teachersData = { teachers, isPending: isTeachersPending, error: teachersError }
  const coursesData = { courses, isPending: isCoursesPending, error: coursesError }
  const subjectsData = { subjects, isPending: isSubjectsPending, error: subjectsError }

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

      <YearStats studentsLength={studentsData.students?.length || 0} teachersLength={teachersData.teachers?.length || 0} coursesLength={coursesData.courses?.length || 0} subjectsLength={subjectsData.subjects?.length || 0} />

      <YearStudents data={studentsData} yearName={year.name} yearId={year.id} />

      <YearTeachers data={teachersData} yearName={year.name} />

      <YearCourses data={coursesData} yearName={year.name} />

      <YearSubjects data={subjectsData} yearName={year.name} />
    </div>
  )
}

