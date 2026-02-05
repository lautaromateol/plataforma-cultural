"use client"

import { useState } from "react"
import { AssignmentSubmissionGrade, QuizAttemptGrade, useGetGrades } from "@/features/grades/api/use-get-grades"
import { useGetLevels } from "@/features/level/api/use-get-levels"
import { useGetCourses } from "@/features/course/api/use-get-courses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectItem } from "@/components/ui/select"
import { GraduationCap, FileText, Users, Award, Filter } from "lucide-react"
import { EditAssignmentGradeDialog } from "@/features/grades/components/edit-assignment-grade-dialog"
import { EditQuizAnswerDialog } from "@/features/grades/components/edit-quiz-answer-dialog"
import { QuizGradesTable } from "./quiz-grades-table"
import { AssignmentGradesTable } from "./assignment-grades-table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface EditingQuizAnswer {
  answer: QuizAttemptGrade["answers"][0]
  attemptId: string
  studentName: string
  quizTitle: string
}

export function TeacherGradesView() {
  const [levelId, setLevelId] = useState<string>("")
  const [courseId, setCourseId] = useState<string>("")
  const [editingAssignment, setEditingAssignment] = useState<AssignmentSubmissionGrade | null>(null)
  const [editingQuizAnswer, setEditingQuizAnswer] = useState<EditingQuizAnswer | null>(null)

  const { levels } = useGetLevels()
  const { courses } = useGetCourses({ levelId: levelId || undefined })
  const { quizAttempts, assignmentSubmissions, isPending } = useGetGrades({
    levelId: levelId || undefined,
    courseId: courseId || undefined,
  })

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

  // Los tipos de la API son compatibles con los tipos de UI para teacher/admin
  // ya que incluyen el campo `student` en la respuesta
  const quizzes = (quizAttempts || []) 
  const assignments = (assignmentSubmissions || [])

  // Calcular estadísticas
  const totalStudents = new Set([
    ...quizzes.map((q) => q.studentId),
    ...assignments.map((a) => a.studentId),
  ]).size

  const totalQuizzes = quizzes.length
  const totalAssignments = assignments.length
  const averageQuizScore = totalQuizzes > 0
    ? quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / totalQuizzes
    : 0

  const handleClearFilters = () => {
    setLevelId("")
    setCourseId("")
  }

  const handleEditQuizAnswer = (
    answer: QuizAttemptGrade["answers"][0],
    attemptId: string,
    studentName: string,
    quizTitle: string
  ) => {
    setEditingQuizAnswer({ answer, attemptId, studentName, quizTitle })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Gestión de Calificaciones
        </h1>
        <p className="text-muted-foreground text-lg">
          Visualiza y edita las calificaciones de tus estudiantes
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <CardTitle>Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Nivel</label>
              <Select
                value={levelId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setLevelId(e.target.value)
                  setCourseId("") // Reset course when level changes
                }}
                placeholder="Todos los niveles"
              >
                <SelectItem value="">Todos los niveles</SelectItem>
                {levels?.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Curso</label>
              <Select
                value={courseId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCourseId(e.target.value)}
                disabled={!levelId}
                placeholder="Todos los cursos"
              >
                <SelectItem value="">Todos los cursos</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {(levelId || courseId) && (
              <div className="flex items-end">
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estudiantes
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Intentos de Cuestionario
            </CardTitle>
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <GraduationCap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuizzes}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entregas de Tareas
            </CardTitle>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promedio Cuestionarios
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageQuizScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Card>
        <Tabs defaultValue="quizzes" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="quizzes" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Cuestionarios
                <Badge variant="secondary" className="ml-auto">
                  {totalQuizzes}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tareas
                <Badge variant="secondary" className="ml-auto">
                  {totalAssignments}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="quizzes" className="mt-0">
              <QuizGradesTable
                data={quizzes}
                isTeacher
                onEditAnswer={handleEditQuizAnswer}
              />
            </TabsContent>
            <TabsContent value="assignments" className="mt-0">
              <AssignmentGradesTable
                data={assignments}
                isTeacher
                onEdit={setEditingAssignment}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Dialogs */}
      {editingAssignment && (
        <EditAssignmentGradeDialog
          isOpen={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          submission={editingAssignment}
        />
      )}

      {editingQuizAnswer && (
        <EditQuizAnswerDialog
          isOpen={!!editingQuizAnswer}
          onClose={() => setEditingQuizAnswer(null)}
          answer={editingQuizAnswer.answer}
          attemptId={editingQuizAnswer.attemptId}
          studentName={editingQuizAnswer.studentName}
          quizTitle={editingQuizAnswer.quizTitle}
        />
      )}
    </div>
  )
}
