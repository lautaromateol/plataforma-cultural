"use client"

import * as React from "react"
import { useState } from "react"
import { useGetQuizzes } from "../api/use-get-quizzes"
import { useDeleteQuiz } from "../api/use-delete-quiz"
import { CreateQuizDialog } from "./create-quiz-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  FileText,
  Clock,
  Calendar,
  Eye,
  Trash2,
  Edit,
  Play,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useGetUser } from "@/features/auth/api/use-get-user"

interface QuizListProps {
  subjectId: string
}

export function QuizList({ subjectId }: QuizListProps) {
  const router = useRouter()
  const { user } = useGetUser()
  const { quizzes, isPending } = useGetQuizzes(subjectId)
  const { deleteQuiz, isDeletingQuiz } = useDeleteQuiz(subjectId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN"

  const handleDeleteClick = (quizId: string) => {
    setQuizToDelete(quizId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (quizToDelete) {
      deleteQuiz(quizToDelete)
      setDeleteDialogOpen(false)
      setQuizToDelete(null)
    }
  }

  const handleStartQuiz = (quizId: string) => {
    router.push(`/campus/quiz/${quizId}/start`)
  }

  const handleViewAttempts = (quizId: string) => {
    router.push(`/campus/quiz/${quizId}/attempts`)
  }

  const handleViewReview = (attemptId: string) => {
    router.push(`/campus/quiz/review/${attemptId}`)
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-slate-200 rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay cuestionarios
          </h3>
          <p className="text-slate-600 mb-6">
            {isTeacher
              ? "Crea tu primer cuestionario para que los alumnos puedan realizarlo"
              : "Aún no hay cuestionarios disponibles para esta materia"}
          </p>
          {isTeacher && (
            <CreateQuizDialog subjectId={subjectId} />
          )}
        </CardContent>
      </Card>
    )
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      {isTeacher && (
        <div className="flex justify-end">
          <CreateQuizDialog subjectId={subjectId} />
        </div>
      )}

      {quizzes.map((quiz: any) => {
        const startDate = new Date(quiz.startDate)
        const endDate = new Date(quiz.endDate)
        const isAvailable = now >= startDate && now <= endDate
        const isUpcoming = now < startDate
        const isExpired = now > endDate

        // Para estudiantes, verificar si ya tienen un intento
        const latestAttempt = quiz.attempts?.[0]
        const hasAttempt = !!latestAttempt
        const isSubmitted = latestAttempt?.isSubmitted

        return (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="mt-1">
                      {quiz.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {isTeacher && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAttempts(quiz.id)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Ver Intentos
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(quiz.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {quiz.timeLimit} minutos
                </Badge>
                <Badge
                  variant={
                    isAvailable
                      ? "default"
                      : isUpcoming
                      ? "secondary"
                      : "outline"
                  }
                  className="flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  {isAvailable
                    ? "Disponible"
                    : isUpcoming
                    ? "Próximamente"
                    : "Finalizado"}
                </Badge>
                {quiz.allowReview && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Revisión habilitada
                  </Badge>
                )}
              </div>

              <div className="text-sm text-slate-600 space-y-1 mb-4">
                <p>
                  <span className="font-medium">Inicio:</span>{" "}
                  {startDate.toLocaleString("es-ES")}
                </p>
                <p>
                  <span className="font-medium">Cierre:</span>{" "}
                  {endDate.toLocaleString("es-ES")}
                </p>
              </div>

              {!isTeacher && (
                <div className="flex gap-2">
                  {isAvailable && !hasAttempt && (
                    <Button onClick={() => handleStartQuiz(quiz.id)}>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Cuestionario
                    </Button>
                  )}
                  {isAvailable && hasAttempt && !isSubmitted && (
                    <Button onClick={() => router.push(`/campus/quiz/attempt/${latestAttempt.id}`)}>
                      Continuar Cuestionario
                    </Button>
                  )}
                  {hasAttempt && isSubmitted && quiz.allowReview && (
                    <Button
                      variant="outline"
                      onClick={() => handleViewReview(latestAttempt.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Revisión
                    </Button>
                  )}
                  {hasAttempt && isSubmitted && (
                    <div className="flex items-center gap-2 text-sm">
                      {latestAttempt.score !== null ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-slate-600">
                            Puntaje: {latestAttempt.score}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-slate-600">Pendiente de corrección</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuestionario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los intentos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingQuiz}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingQuiz ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
