"use client"

import { useParams, useRouter } from "next/navigation"
import { useGetCourse } from "@/features/course/api/use-get-course"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, BookOpen, GraduationCap, MapPin, Calendar, ArrowLeft } from "lucide-react"
import { StudentsTable } from "./components/students-table"
import { SubjectsAssignmentTable } from "./components/subjects-assignment-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { course, isPending, error } = useGetCourse(id)

  if (isPending) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
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

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No encontrado</AlertTitle>
          <AlertDescription>No se encontró información para este curso</AlertDescription>
        </Alert>
      </div>
    )
  }

  const enrollmentsCount = course._count?.enrollments || course.enrollments?.length || 0
  const occupancyPercentage = course.capacity > 0 ? (enrollmentsCount / course.capacity) * 100 : 0

  let occupancyColor = "bg-green-50 text-green-600 border-green-200"
  if (occupancyPercentage >= 90) {
    occupancyColor = "bg-red-50 text-red-600 border-red-200"
  } else if (occupancyPercentage >= 70) {
    occupancyColor = "bg-blue-50 text-blue-600 border-blue-200"
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">{course.name}</h1>
            <Badge variant="outline" className={occupancyColor}>
              {Math.round(occupancyPercentage)}% ocupado
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {course.year && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>{course.year.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Año Académico {course.academicYear}</span>
            </div>
            {course.classroom && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{course.classroom}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Matriculados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollmentsCount} / {course.capacity}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {course.capacity - enrollmentsCount} cupos disponibles
            </p>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  occupancyPercentage >= 90
                    ? "bg-red-500"
                    : occupancyPercentage >= 70
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.subjectsWithAssignment?.length || course.year?.subjects?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {course.subjectsWithAssignment?.filter((s) => s.teacher).length || 0} con profesor asignado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aula</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.classroom || "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ubicación asignada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Materias del Año
          </CardTitle>
          <CardDescription>
            Gestiona la asignación de profesores a las materias de {course.year?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {course.subjectsWithAssignment && course.subjectsWithAssignment.length > 0 ? (
            <SubjectsAssignmentTable
              data={course.subjectsWithAssignment}
              courseId={course.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Sin materias configuradas</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                No hay materias registradas para {course.year?.name}. 
                Primero debes crear materias en la sección de administración.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Matriculados</CardTitle>
          <CardDescription>
            Listado de todos los estudiantes en {course.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsTable 
            data={course.enrollments || []} 
            courseId={course.id} 
            yearId={course.yearId}
          />
        </CardContent>
      </Card>
    </div>
  )
}

