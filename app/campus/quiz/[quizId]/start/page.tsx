"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useStartQuizAttempt } from "@/features/quiz/api/use-start-quiz-attempt"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

export default function StartQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string
  const { startQuizAttemptAsync, isStartingAttempt } = useStartQuizAttempt()

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const result = await startQuizAttemptAsync({ quizId })
        if (result?.attempt) {
          router.push(`/campus/quiz/attempt/${result.attempt.id}`)
        }
      } catch (error) {
        console.error("Error al iniciar cuestionario:", error)
        router.back()
      }
    }

    startQuiz()
  }, [quizId, startQuizAttemptAsync, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-slate-600" />
          <p className="text-slate-600">
            {isStartingAttempt ? "Iniciando cuestionario..." : "Redirigiendo..."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
