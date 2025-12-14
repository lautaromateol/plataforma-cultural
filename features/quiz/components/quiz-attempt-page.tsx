"use client"

import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useGetQuizAttempt } from "../api/use-get-quiz-attempt"
import { useSubmitAnswer } from "../api/use-submit-answer"
import { useSubmitQuizAttempt } from "../api/use-submit-quiz-attempt"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
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

export function QuizAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const { attempt, isPending, error } = useGetQuizAttempt(attemptId)
  const { submitAnswerAsync } = useSubmitAnswer(attemptId)
  const { submitQuizAttemptAsync, isSubmittingAttempt } = useSubmitQuizAttempt()

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // Inicializar timer
  useEffect(() => {
    if (!attempt || attempt.isSubmitted) return

    const quiz = attempt.quiz
    const startedAt = new Date(attempt.startedAt).getTime()
    const timeLimitMs = quiz.timeLimit * 60 * 1000
    const elapsed = Date.now() - startedAt
    const remaining = Math.max(0, timeLimitMs - elapsed)

    setTimeRemaining(Math.floor(remaining / 1000))

    // Si ya se agotó el tiempo, enviar automáticamente
    if (remaining <= 0) {
      handleAutoSubmit()
      return
    }

    // Timer que actualiza cada segundo
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Guardar tiempo restante en localStorage para persistencia
    const saveTimer = () => {
      if (timeRemaining !== null) {
        localStorage.setItem(`quiz-timer-${attemptId}`, timeRemaining.toString())
        localStorage.setItem(`quiz-timer-start-${attemptId}`, Date.now().toString())
      }
    }

    const saveInterval = setInterval(saveTimer, 5000) // Guardar cada 5 segundos

    // Cargar tiempo guardado si existe
    const savedTime = localStorage.getItem(`quiz-timer-${attemptId}`)
    const savedStart = localStorage.getItem(`quiz-timer-start-${attemptId}`)
    if (savedTime && savedStart) {
      const savedTimeNum = parseInt(savedTime)
      const savedStartNum = parseInt(savedStart)
      const elapsedSinceSave = Math.floor((Date.now() - savedStartNum) / 1000)
      const newRemaining = Math.max(0, savedTimeNum - elapsedSinceSave)
      setTimeRemaining(newRemaining)
    }

    // Auto-envío cuando se cierra la pestaña o se recarga
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      handleAutoSubmit()
      return (e.returnValue = "")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        handleAutoSubmit()
      }
    })

    return () => {
      clearInterval(interval)
      clearInterval(saveInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      localStorage.removeItem(`quiz-timer-${attemptId}`)
      localStorage.removeItem(`quiz-timer-start-${attemptId}`)
    }
  }, [attempt, attemptId])

  // Cargar respuestas existentes
  useEffect(() => {
    if (attempt?.answers) {
      const answersMap: Record<string, any> = {}
      attempt.answers.forEach((answer: any) => {
        answersMap[answer.questionId] = {
          textAnswer: answer.textAnswer,
          selectedOptionIds: answer.selectedOptions?.map((ao: any) => ao.optionId) || [],
        }
      })
      setAnswers(answersMap)
    }
  }, [attempt])

  const handleAutoSubmit = useCallback(async () => {
    if (!attempt || attempt.isSubmitted) return

    try {
      const currentTimeRemaining = timeRemaining || 0
      await submitQuizAttemptAsync({
        attemptId: attempt.id,
        timeRemaining: currentTimeRemaining,
      })
      toast.success("Cuestionario enviado automáticamente")
      router.push(`/campus/materia/${attempt.quiz.subjectId}`)
    } catch (error) {
      console.error("Error al enviar automáticamente:", error)
    }
  }, [attempt, timeRemaining, submitQuizAttemptAsync, router])

  const handleAnswerChange = async (
    questionId: string,
    textAnswer?: string,
    selectedOptionIds?: string[]
  ) => {
    // Actualizar estado local inmediatamente
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        textAnswer,
        selectedOptionIds,
      },
    }))

    // Enviar al servidor
    try {
      await submitAnswerAsync({
        questionId,
        attemptId,
        textAnswer,
        selectedOptionIds,
      })
    } catch (error) {
      console.error("Error al guardar respuesta:", error)
      toast.error("Error al guardar la respuesta")
    }
  }

  const handleSubmit = async () => {
    if (!attempt) return

    try {
      await submitQuizAttemptAsync({
        attemptId: attempt.id,
        timeRemaining: timeRemaining || 0,
      })
      toast.success("Cuestionario enviado exitosamente")
      router.push(`/campus/materia/${attempt.quiz.subjectId}`)
    } catch (error) {
      console.error("Error al enviar:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto" />
          <p className="text-slate-600">Cargando cuestionario...</p>
        </div>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Error al cargar el cuestionario"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (attempt.isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Cuestionario ya enviado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Este cuestionario ya fue enviado el{" "}
              {new Date(attempt.submittedAt || "").toLocaleString()}
            </p>
            <Button
              onClick={() => router.push(`/campus/materia/${attempt.quiz.subjectId}`)}
            >
              Volver a la materia
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quiz = attempt.quiz
  const questions = quiz.questions || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header con timer */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-slate-600 mt-2">{quiz.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5" />
                <span
                  className={
                    timeRemaining !== null && timeRemaining < 300
                      ? "text-red-600"
                      : "text-slate-900"
                  }
                >
                  {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Preguntas */}
        <div className="space-y-6">
          {questions.map((question: any, index: number) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              answer={answers[question.id]}
              onChange={handleAnswerChange}
            />
          ))}
        </div>

        {/* Botón de envío */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                {Object.keys(answers).length} de {questions.length} preguntas respondidas
              </p>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                size="lg"
                disabled={isSubmittingAttempt}
              >
                {isSubmittingAttempt ? "Enviando..." : "Enviar Cuestionario"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar cuestionario?</AlertDialogTitle>
            <AlertDialogDescription>
              Una vez enviado, no podrás modificar tus respuestas. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface QuestionCardProps {
  question: any
  index: number
  answer?: {
    textAnswer?: string
    selectedOptionIds?: string[]
  }
  onChange: (questionId: string, textAnswer?: string, selectedOptionIds?: string[]) => void
}

function QuestionCard({ question, index, answer, onChange }: QuestionCardProps) {
  const handleTextChange = (value: string) => {
    onChange(question.id, value)
  }

  const handleSingleChoiceChange = (optionId: string) => {
    onChange(question.id, undefined, [optionId])
  }

  const handleMultipleChoiceChange = (optionId: string, checked: boolean) => {
    const currentIds = answer?.selectedOptionIds || []
    const newIds = checked
      ? [...currentIds, optionId]
      : currentIds.filter((id) => id !== optionId)
    onChange(question.id, undefined, newIds)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Pregunta {index + 1} ({question.points} {question.points === 1 ? "punto" : "puntos"})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700 font-medium">{question.statement}</p>

        {question.type === "TEXT" && (
          <Textarea
            value={answer?.textAnswer || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={5}
            className="resize-none"
          />
        )}

        {question.type === "SINGLE_CHOICE" && (
          <RadioGroup
            value={answer?.selectedOptionIds?.[0] || ""}
            onValueChange={handleSingleChoiceChange}
          >
            {question.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-3">
            {question.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={answer?.selectedOptionIds?.includes(option.id) || false}
                  onCheckedChange={(checked) =>
                    handleMultipleChoiceChange(option.id, checked as boolean)
                  }
                />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
