"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUp, Clock, Download, AlertCircle, TrendingUp, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"

interface UserAssignmentSubmissionsProps {
  submissions: any[]
}

export function UserAssignmentSubmissions({ submissions }: UserAssignmentSubmissionsProps) {
  const gradedSubmissions = submissions?.filter(s => s.grade !== null && s.grade !== undefined) || []
  const averageGrade = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(1)
    : null

  if (!submissions || submissions.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="bg-linear-to-r from-blue-50 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-blue-600" />
            Entregas
          </CardTitle>
          <CardDescription>
            Tareas entregadas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <FileUp className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sin entregas
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-linear-to-r from-blue-50 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-blue-600" />
              Entregas
            </CardTitle>
            <CardDescription>
              {submissions.length} {submissions.length === 1 ? 'entrega' : 'entregas'} en total
            </CardDescription>
          </div>
          {averageGrade !== null && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>Promedio</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{averageGrade}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {submissions.map((submission) => {
            const hasGrade = submission.grade !== null && submission.grade !== undefined
            const assignment = submission.assignment
            const isLate = assignment.dueDate && new Date(submission.submittedAt) > new Date(assignment.dueDate)
            const courseSubject = assignment.assignmentCourseSubjects?.[0]?.courseSubject
            const subjectName = courseSubject?.subject?.name || "Sin materia"

            return (
              <div
                key={submission.id}
                className="group border-2 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all p-4"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{assignment.title}</h4>
                        {isLate && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Tarde
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{subjectName}</p>
                    </div>

                    {assignment.hasGrade && (
                      <div className="shrink-0 text-right">
                        {hasGrade ? (
                          <p className="text-xl font-bold text-blue-600">{submission.grade}</p>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(submission.submittedAt), "dd/MM/yy", { locale: es })}</span>
                    </div>
                    {assignment.dueDate && (
                      <>
                        <span>•</span>
                        <span>Vence: {format(new Date(assignment.dueDate), "dd/MM/yy", { locale: es })}</span>
                      </>
                    )}
                  </div>

                  {/* Archivo */}
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hover:bg-blue-50">
                      <Download className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{submission.fileName}</span>
                      <span className="text-muted-foreground">
                        ({(submission.fileSize / 1024).toFixed(0)} KB)
                      </span>
                    </Button>
                  </a>

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className="h-3 w-3 text-blue-600" />
                        <p className="text-xs font-medium text-blue-900">Retroalimentación</p>
                      </div>
                      <p className="text-xs text-blue-800">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
