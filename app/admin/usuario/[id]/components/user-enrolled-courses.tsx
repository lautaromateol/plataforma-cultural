"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, Calendar, DoorOpen } from "lucide-react"

interface UserEnrolledCoursesProps {
  enrollments: any[]
}

const statusConfig: Record<string, { label: string; variant: string; color: string }> = {
  ACTIVE: {
    label: "Activo",
    variant: "bg-green-50 text-green-700 border-green-200",
    color: "bg-green-500"
  },
  INACTIVE: {
    label: "Inactivo",
    variant: "bg-gray-50 text-gray-700 border-gray-200",
    color: "bg-gray-400"
  },
  GRADUATED: {
    label: "Graduado",
    variant: "bg-blue-50 text-blue-700 border-blue-200",
    color: "bg-blue-500"
  },
  TRANSFERRED: {
    label: "Transferido",
    variant: "bg-yellow-50 text-yellow-700 border-yellow-200",
    color: "bg-yellow-500"
  },
}

export function UserEnrolledCourses({ enrollments }: UserEnrolledCoursesProps) {
  if (!enrollments || enrollments.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="bg-linear-to-r from-purple-50 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Cursos Matriculados
          </CardTitle>
          <CardDescription>
            Cursos en los que está matriculado el estudiante
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-purple-100 p-4 mb-4">
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-muted-foreground">
              No hay cursos matriculados
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-linear-to-r from-purple-50 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          Cursos Matriculados
        </CardTitle>
        <CardDescription>
          Total de {enrollments.length} {enrollments.length === 1 ? 'curso' : 'cursos'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          {enrollments.map((enrollment) => {
            const config = statusConfig[enrollment.status] || statusConfig.ACTIVE
            return (
              <div
                key={enrollment.id}
                className="group relative overflow-hidden border-2 rounded-xl hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`} />
                <div className="p-5 pl-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{enrollment.course.name}</h3>
                          <Badge variant="outline" className={config.variant}>
                            {config.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {enrollment.course.year && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{enrollment.course.year.name}</span>
                            </div>
                          )}
                          {enrollment.course.academicYear && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Período {enrollment.course.academicYear}</span>
                            </div>
                          )}
                          {enrollment.course.classroom && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DoorOpen className="h-3.5 w-3.5" />
                              <span>{enrollment.course.classroom}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
