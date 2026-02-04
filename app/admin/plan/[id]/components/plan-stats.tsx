import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Layers, School, Users } from "lucide-react"
import { StudyPlanDetails } from "@/features/study-plan/api/use-get-study-plan-details"

interface PlanStatsProps {
  studyPlan: StudyPlanDetails
}

export function PlanStats({ studyPlan }: PlanStatsProps) {
  // Calcular estadísticas del plan
  const levelsCount = studyPlan.levels?.length ?? 0

  const coursesCount = studyPlan.levels?.reduce(
    (acc, level) => acc + (level.courses?.length ?? 0),
    0
  ) ?? 0

  const subjectsCount = studyPlan.levels?.reduce(
    (acc, level) => acc + (level.subjects?.length ?? 0),
    0
  ) ?? 0

  // Obtener estudiantes únicos de todos los cursos
  const studentsSet = new Set<string>()
  studyPlan.levels?.forEach((level) => {
    level.courses?.forEach((course) => {
      course.enrollments?.forEach((enrollment) => {
        if (enrollment.student?.id) {
          studentsSet.add(enrollment.student.id)
        }
      })
    })
  })
  const studentsCount = studentsSet.size

  // Obtener profesores únicos de todos los cursos
  const teachersSet = new Set<string>()
  studyPlan.levels?.forEach((level) => {
    level.courses?.forEach((course) => {
      course.courseSubjects?.forEach((cs) => {
        if (cs.teacher?.id) {
          teachersSet.add(cs.teacher.id)
        }
      })
    })
  })
  const teachersCount = teachersSet.size

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Niveles</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{levelsCount}</div>
          <p className="text-xs text-muted-foreground">En el plan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentsCount}</div>
          <p className="text-xs text-muted-foreground">Matriculados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profesores</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teachersCount}</div>
          <p className="text-xs text-muted-foreground">Dictando clases</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cursos</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coursesCount}</div>
          <p className="text-xs text-muted-foreground">Grupos activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Materias</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subjectsCount}</div>
          <p className="text-xs text-muted-foreground">Asignaturas</p>
        </CardContent>
      </Card>
    </div>
  )
}
