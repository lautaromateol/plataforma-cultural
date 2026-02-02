"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileQuestion, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UserQuizGradesProps {
  quizAttempts: any[]
}

export function UserQuizGrades({ quizAttempts }: UserQuizGradesProps) {
  const submittedAttempts = quizAttempts?.filter(a => a.isSubmitted) || []
  const gradedAttempts = submittedAttempts.filter(a => a.score !== null && a.score !== undefined)
  const averageScore = gradedAttempts.length > 0
    ? Math.round(gradedAttempts.reduce((sum, a) => sum + a.score, 0) / gradedAttempts.length)
    : null

  if (!quizAttempts || quizAttempts.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-orange-600" />
            Cuestionarios
          </CardTitle>
          <CardDescription>
            Calificaciones de cuestionarios
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-orange-100 p-3 mb-3">
              <FileQuestion className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sin cuestionarios
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-orange-600" />
              Cuestionarios
            </CardTitle>
            <CardDescription>
              {quizAttempts.length} {quizAttempts.length === 1 ? 'intento' : 'intentos'} en total
            </CardDescription>
          </div>
          {averageScore !== null && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>Promedio</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{averageScore}%</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {quizAttempts.map((attempt) => {
            const isSubmitted = attempt.isSubmitted
            const hasScore = attempt.score !== null && attempt.score !== undefined
            const scorePercentage = hasScore ? Math.round(attempt.score) : null
            const scoreColor = scorePercentage
              ? scorePercentage >= 70 ? 'text-green-600'
              : scorePercentage >= 40 ? 'text-yellow-600'
              : 'text-red-600'
              : ''

            return (
              <div
                key={attempt.id}
                className="group border-2 rounded-lg hover:border-orange-200 hover:shadow-sm transition-all p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{attempt.quiz.title}</h4>
                      {isSubmitted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{attempt.quiz.subject?.name || "Sin materia"}</span>
                      {attempt.submittedAt && (
                        <>
                          <span>•</span>
                          <span className="shrink-0">
                            {format(new Date(attempt.submittedAt), "dd/MM/yy", { locale: es })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSubmitted ? (
                      hasScore ? (
                        <div className="text-right">
                          <p className={`text-xl font-bold ${scoreColor}`}>
                            {scorePercentage}%
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                          Pendiente
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">
                        No entregado
                      </Badge>
                    )}
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
