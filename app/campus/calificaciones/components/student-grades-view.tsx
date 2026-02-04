"use client"

import { useGetGrades } from "@/features/grades/api/use-get-grades"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GraduationCap, FileText, Calendar, Award, BookOpen, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { QuizAttemptGrade, AssignmentSubmissionGrade } from "@/features/grades/types"

export function StudentGradesView() {
  const { quizAttempts, assignmentSubmissions, isPending } = useGetGrades()

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

  const cuestionarios = (quizAttempts || []) as QuizAttemptGrade[]
  const assignments = (assignmentSubmissions || []) as AssignmentSubmissionGrade[]

  // Calcular estadísticas
  const totalCuestionarios = cuestionarios.length
  const totalAssignments = assignments.filter((a) => a.grade !== null).length
  const averageQuizScore = totalCuestionarios > 0
    ? cuestionarios.reduce((sum, q) => sum + (q.score || 0), 0) / totalCuestionarios
    : 0
  const averageAssignmentScore = totalAssignments > 0
    ? assignments
        .filter((a) => a.grade !== null)
        .reduce((sum, a) => sum + (a.grade ?? 0), 0) / totalAssignments
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Mis Calificaciones
        </h1>
        <p className="text-muted-foreground text-lg">
          Visualiza tus calificaciones de Cuestionarios y entregas de tareas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cuestionarios Realizados
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCuestionarios}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas Calificadas
            </CardTitle>
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promedio Cuestionarios
            </CardTitle>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageQuizScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promedio Tareas
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageAssignmentScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuestionarios Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Calificaciones de Cuestionarios</h2>
        </div>

        {cuestionarios.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">
                No tienes calificaciones de cuestionarios aún
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cuestionarios.map((attempt) => {
              const subject = attempt.quiz.subject
              const courseSubject = subject.courseSubjects?.[0]
              const maxScore = attempt.answers.reduce(
                (sum, answer) => sum + (answer.question.points || 0),
                0
              )
              const percentage = maxScore > 0 ? ((attempt.score || 0) / maxScore) * 100 : 0

              return (
                <Card
                  key={attempt.id}
                  className="relative overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg font-bold">
                          {attempt.quiz.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{subject.name}</span>
                          </div>
                          {courseSubject?.course && (
                            <Badge variant="outline" className="text-xs">
                              {courseSubject.course.name}
                            </Badge>
                          )}
                          {subject.level && (
                            <Badge variant="outline" className="text-xs">
                              {subject.level.name}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {(attempt.score || 0).toFixed(1)}
                          <span className="text-lg text-muted-foreground">
                            /{maxScore}
                          </span>
                        </div>
                        <Badge
                          variant={percentage >= 60 ? "default" : "destructive"}
                          className={
                            percentage >= 60
                              ? "bg-linear-to-r from-green-500 to-emerald-600"
                              : ""
                          }
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {attempt.submittedAt
                            ? format(new Date(attempt.submittedAt), "d 'de' MMMM, yyyy", {
                                locale: es,
                              })
                            : "No completado"}
                        </span>
                      </div>
                      {courseSubject?.teacher && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Profesor:</span>
                          <span>{courseSubject.teacher.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Assignments Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-linear-to-br from-violet-500 to-purple-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Calificaciones de Tareas</h2>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">
                No tienes calificaciones de tareas aún
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((submission) => {
              const courseSubject = submission.assignment.assignmentCourseSubjects[0]?.courseSubject
              const subject = courseSubject?.subject
              const hasGrade = submission.grade !== null

              return (
                <Card
                  key={submission.id}
                  className="relative overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg font-bold">
                          {submission.assignment.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2">
                          {subject && (
                            <>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{subject.name}</span>
                              </div>
                              {courseSubject?.course && (
                                <Badge variant="outline" className="text-xs">
                                  {courseSubject.course.name}
                                </Badge>
                              )}
                              {subject.level && (
                                <Badge variant="outline" className="text-xs">
                                  {subject.level.name}
                                </Badge>
                              )}
                            </>
                          )}
                        </CardDescription>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {hasGrade && submission.grade !== null ? (
                          <>
                            <div className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                              {submission.grade.toFixed(1)}
                              <span className="text-lg text-muted-foreground">/10</span>
                            </div>
                            <Badge
                              variant={submission.grade >= 6 ? "default" : "destructive"}
                              className={
                                submission.grade >= 6
                                  ? "bg-linear-to-r from-green-500 to-emerald-600"
                                  : ""
                              }
                            >
                              {submission.grade >= 6 ? "Aprobado" : "Desaprobado"}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="secondary">Sin calificar</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {submission.submittedAt
                            ? format(new Date(submission.submittedAt), "d 'de' MMMM, yyyy", {
                                locale: es,
                              })
                            : "No entregado"}
                        </span>
                      </div>
                      {courseSubject?.teacher && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Profesor:</span>
                          <span>{courseSubject.teacher.name}</span>
                        </div>
                      )}
                    </div>

                    {submission.feedback && (
                      <div className="rounded-lg bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 border">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Retroalimentación del profesor
                        </p>
                        <p className="text-sm text-foreground">{submission.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
