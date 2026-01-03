"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useGetQuizAttempts } from "../api/use-get-quiz-attempts"
import { useGetQuiz } from "../api/use-get-quiz"
import { useCorrectAnswer } from "../api/use-correct-answer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, XCircle, Clock, User } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function QuizAttemptsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz } = useGetQuiz(quizId)
  const { attempts, isPending } = useGetQuizAttempts(quizId)

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto" />
          <p className="text-slate-600">Cargando intentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Intentos - {quiz?.title || "Cuestionario"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!attempts || attempts.length === 0 ? (
              <p className="text-center text-slate-600 py-8">
                Aún no hay intentos para este cuestionario
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Iniciado</TableHead>
                    <TableHead>Enviado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt: any) => (
                    <AttemptRow key={attempt.id} attempt={attempt} quiz={quiz} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface AttemptRowProps {
  attempt: any
  quiz: any
}

function AttemptRow({ attempt, quiz }: AttemptRowProps) {
  const router = useRouter()
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false)
  const { correctAnswerAsync, isCorrectingAnswer } = useCorrectAnswer(attempt.id)

  const needsCorrection = attempt.answers?.some(
    (a: any) => a.needsManualReview || a.isCorrect === null
  )

  const handleViewDetails = () => {
    router.push(`/campus/quiz/attempt/${attempt.id}`)
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>{attempt.student.name}</span>
          </div>
        </TableCell>
        <TableCell>
          {new Date(attempt.startedAt).toLocaleString("es-ES")}
        </TableCell>
        <TableCell>
          {attempt.submittedAt
            ? new Date(attempt.submittedAt).toLocaleString("es-ES")
            : "-"}
        </TableCell>
        <TableCell>
          {attempt.isSubmitted ? (
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" />
              Enviado
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              <Clock className="w-3 h-3" />
              En progreso
            </Badge>
          )}
        </TableCell>
        <TableCell>
          {attempt.score !== null ? (
            <span className="font-semibold">{attempt.score}</span>
          ) : (
            <Badge variant="outline" className="text-amber-600">
              Pendiente
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewDetails}>
              Ver Detalles
            </Button>
            {needsCorrection && attempt.isSubmitted && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCorrectionDialog(true)}
              >
                Corregir
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      <CorrectionDialog
        open={showCorrectionDialog}
        onOpenChange={setShowCorrectionDialog}
        attempt={attempt}
        quiz={quiz}
        onCorrect={correctAnswerAsync}
        isCorrecting={isCorrectingAnswer}
      />
    </>
  )
}

interface CorrectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attempt: any
  quiz: any
  onCorrect: (data: { answerId: string; points: number; isCorrect: boolean }) => Promise<any>
  isCorrecting: boolean
}

function CorrectionDialog({
  open,
  onOpenChange,
  attempt,
  quiz,
  onCorrect,
  isCorrecting,
}: CorrectionDialogProps) {
  const [corrections, setCorrections] = useState<Record<string, { points: number; isCorrect: boolean }>>({})

  React.useEffect(() => {
    if (attempt?.answers) {
      const initialCorrections: Record<string, { points: number; isCorrect: boolean }> = {}
      attempt.answers.forEach((answer: any) => {
        if (answer.needsManualReview || answer.isCorrect === null) {
          initialCorrections[answer.id] = {
            points: answer.points || 0,
            isCorrect: answer.isCorrect || false,
          }
        }
      })
      setCorrections(initialCorrections)
    }
  }, [attempt])

  const handleSubmit = async () => {
    for (const [answerId, correction] of Object.entries(corrections)) {
      await onCorrect({
        answerId,
        points: correction.points,
        isCorrect: correction.isCorrect,
      })
    }
    onOpenChange(false)
  }

  const questions = quiz?.questions || []
  const answersMap = new Map(
    attempt?.answers?.map((a: any) => [a.questionId, a]) || []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Corregir Respuestas - {attempt?.student?.name}</DialogTitle>
          <DialogDescription>
            Corrige las respuestas que requieren revisión manual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {questions.map((question: any, index: number) => {
            const answer = answersMap.get(question.id) as any
            if (!answer || (!answer.needsManualReview && answer.isCorrect !== null)) {
              return null
            }

            const correction = corrections[answer.id] || {
              points: answer.points || 0,
              isCorrect: answer.isCorrect || false,
            }

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Pregunta {index + 1} ({question.points} puntos)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">{question.statement}</p>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-600 mb-2">Respuesta del alumno:</p>
                    {question.type === "TEXT" && (
                      <p>{answer.textAnswer || "Sin respuesta"}</p>
                    )}
                    {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && (
                      <div className="space-y-1">
                        {answer.selectedOptions?.map((ao: any) => (
                          <div key={ao.optionId} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                            <span>{ao.option.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>¿Es correcta?</Label>
                      <Checkbox
                        checked={correction.isCorrect}
                        onCheckedChange={(checked) => {
                          setCorrections({
                            ...corrections,
                            [answer.id]: {
                              ...correction,
                              isCorrect: checked as boolean,
                            },
                          })
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>Puntos:</Label>
                      <Input
                        type="number"
                        min={0}
                        max={question.points}
                        value={correction.points}
                        onChange={(e) => {
                          setCorrections({
                            ...corrections,
                            [answer.id]: {
                              ...correction,
                              points: parseFloat(e.target.value) || 0,
                            },
                          })
                        }}
                        className="w-24"
                      />
                      <span className="text-sm text-slate-600">
                        / {question.points} puntos
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCorrecting}>
            {isCorrecting ? "Corrigiendo..." : "Guardar Correcciones"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
