import { format } from "date-fns"
import { es } from "date-fns/locale"
import { BookOpen, Calendar, GraduationCap } from "lucide-react"
import { QuizAttemptGrade } from "../api/use-get-grades"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GradesQuizzesSectionProps {
    quizAttempts: QuizAttemptGrade[] | undefined
}

export function GradesQuizzesSection({ quizAttempts }: GradesQuizzesSectionProps) {

    const quizzes = (quizAttempts || [])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600">
                    <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Calificaciones de Cuestionarios</h2>
            </div>

            {quizzes.length === 0 ? (
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
                    {quizzes.map((attempt) => {
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
    )
}