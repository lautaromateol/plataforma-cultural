"use client"

import { useParams } from "next/navigation"
import { useGetYearDetails } from "@/features/year/api/use-get-year-details"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, BookOpen, School, GraduationCap } from "lucide-react"
import { StudentsTable } from "./components/students-table"
import { TeachersTable } from "./components/teachers-table"
import { CoursesTable } from "./components/courses-table"
import { SubjectsTable } from "./components/subjects-table"

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

  const { year, students, teachers, courses, subjects } = yearDetails

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{year.name}</h1>
        {year.description && (
          <p className="text-muted-foreground mt-2">{year.description}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Matriculados en el año
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              Dictando clases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Grupos de estudiantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Asignaturas del año
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Matriculados</CardTitle>
          <CardDescription>
            Gestiona las matrículas de estudiantes en {year.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsTable data={students} courses={courses} />
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profesores</CardTitle>
          <CardDescription>
            Docentes que dictan clases en {year.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeachersTable data={teachers} />
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos</CardTitle>
          <CardDescription>
            Grupos de estudiantes de {year.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoursesTable data={courses} />
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materias</CardTitle>
          <CardDescription>
            Asignaturas que se dictan en {year.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectsTable data={subjects} />
        </CardContent>
      </Card>
    </div>
  )
}

