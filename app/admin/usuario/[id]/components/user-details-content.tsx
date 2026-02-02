"use client"

import { useGetUser } from "@/features/user/api/use-get-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, GraduationCap, User, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { UserPersonalInfo } from "./user-personal-info"
import { UserEnrolledCourses } from "./user-enrolled-courses"
import { UserQuizGrades } from "./user-quiz-grades"
import { UserAssignmentSubmissions } from "./user-assignment-submissions"

interface UserDetailsContentProps {
  userId: string
}

const roleConfig = {
  ADMIN: { label: "Administrador", color: "bg-red-500", icon: User },
  TEACHER: { label: "Profesor", color: "bg-blue-500", icon: GraduationCap },
  STUDENT: { label: "Estudiante", color: "bg-green-500", icon: User },
}

export function UserDetailsContent({ userId }: UserDetailsContentProps) {
  const router = useRouter()
  const { user, isPending, error } = useGetUser(userId)

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando información del usuario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos del usuario: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Usuario no encontrado</AlertDescription>
      </Alert>
    )
  }

  const config = roleConfig[user.role as keyof typeof roleConfig]
  const RoleIcon = config?.icon || User

  return (
    <div className="space-y-8">
      {/* Header Mejorado */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent rounded-lg -z-10" />
        <div className="p-6 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin?section=users")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a usuarios
          </Button>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className={`${config?.color} h-24 w-24 rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-4xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Información Principal */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">{user.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="gap-1.5 px-3 py-1">
                    <RoleIcon className="h-3.5 w-3.5" />
                    {config?.label || user.role}
                  </Badge>
                  <span className="text-muted-foreground">DNI: {user.dni}</span>
                  {user.email && (
                    <span className="text-muted-foreground">• {user.email}</span>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="flex gap-2">
                {user.isVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ Cuenta Verificada
                  </Badge>
                )}
                {user.firstLogin && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Primer Inicio de Sesión
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Personal y de Contacto */}
      <UserPersonalInfo user={user} />

      {/* Cursos Matriculados (solo para estudiantes) */}
      {user.role === "STUDENT" && (
        <>
          <UserEnrolledCourses enrollments={user.enrollments || []} />

          {/* Grid de Calificaciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserQuizGrades quizAttempts={user.quizAttempts || []} />
            <UserAssignmentSubmissions submissions={user.assignmentSubmissions || []} />
          </div>
        </>
      )}

      {/* Materias Asignadas (solo para profesores) */}
      {user.role === "TEACHER" && user.courseSubjects && user.courseSubjects.length > 0 && (
        <Card className="border-2">
          <CardHeader className="bg-linear-to-r from-blue-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Materias Asignadas
            </CardTitle>
            <CardDescription>
              Cursos y materias que imparte el profesor
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3">
              {user.courseSubjects.map((cs: any) => (
                <div
                  key={cs.id}
                  className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{cs.subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cs.course.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
