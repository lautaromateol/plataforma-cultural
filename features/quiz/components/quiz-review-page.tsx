"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useGetQuizReview } from "../api/use-get-quiz-review"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function QuizReviewPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const { attempt, isPending, error } = useGetQuizReview(attemptId)

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Skeleton className="h-32 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              {error?.message || "No se pudo cargar la revisión"}
            </p>
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quiz = attempt.quiz
  const questions = quiz.questions || []
  const answersMap = new Map(
    attempt.answers.map((answer: any) => [answer.questionId, answer])
  )

  const totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0)
  const obtainedPoints = attempt.score || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="text-lg">
                Puntaje: {obtainedPoints} / {totalPoints}
              </Badge>
              {attempt.submittedAt && (
                <span className="text-sm text-slate-600">
                  Enviado el {new Date(attempt.submittedAt).toLocaleString("es-ES")}
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Preguntas y respuestas */}
        <div className="space-y-6">
          {questions.map((question: any, index: number) => {
            const answer = answersMap.get(question.id)
            return (
              <QuestionReviewCard
                key={question.id}
                question={question}
                index={index}
                answer={answer}
              />
            )
          })}
        </div>

        <div className="mt-6">
          <Button onClick={() => router.push(`/campus/materia/${quiz.subjectId}`)}>
            Volver a la materia
          </Button>
        </div>
      </div>
    </div>
  )
}

interface QuestionReviewCardProps {
  question: any
  index: number
  answer?: any
}

function QuestionReviewCard({ question, index, answer }: QuestionReviewCardProps) {
  const isCorrect = answer?.isCorrect === true
  const isIncorrect = answer?.isCorrect === false
  const isPending = answer?.needsManualReview || answer?.isCorrect === null

  return (
    <Card className={isCorrect ? "border-green-500" : isIncorrect ? "border-red-500" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            Pregunta {index + 1} ({question.points} {question.points === 1 ? "punto" : "puntos"})
          </CardTitle>
          <div className="flex items-center gap-2">
            {isPending ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Pendiente
              </Badge>
            ) : isCorrect ? (
              <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Correcta ({answer?.points || 0} puntos)
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-600">
                <XCircle className="w-3 h-3" />
                Incorrecta ({answer?.points || 0} puntos)
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700 font-medium">{question.statement}</p>

        {/* Respuesta del alumno */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-slate-600 mb-2">Tu respuesta:</p>
          {question.type === "TEXT" && (
            <p className="text-slate-900">{answer?.textAnswer || "Sin respuesta"}</p>
          )}
          {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && (
            <div className="space-y-2">
              {answer?.selectedOptions?.map((ao: any) => (
                <div key={ao.optionId} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>{ao.option.text}</span>
                </div>
              )) || <p className="text-slate-500">Sin respuesta</p>}
            </div>
          )}
        </div>

        {/* Respuesta correcta (si tiene corrección automática) */}
        {question.hasAutoCorrection && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-700 mb-2">Respuesta correcta:</p>
            {question.type === "TEXT" && (
              <p className="text-green-900">(Comparación de texto)</p>
            )}
            {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && (
              <div className="space-y-2">
                {question.options
                  ?.filter((opt: any) => opt.isCorrect)
                  .map((opt: any) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-900">{opt.text}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
