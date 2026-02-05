import { FileText, BookOpen, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AssignmentSubmissionGrade } from "@/features/grades/api/use-get-grades"

interface GradesAssignmentsSectionProps {
    assignmentSubmissions: AssignmentSubmissionGrade[] | undefined
}

export function GradesAssignmentsSection({ assignmentSubmissions }: GradesAssignmentsSectionProps) {

    const assignments = (assignmentSubmissions || [])

    return (
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
    )
}