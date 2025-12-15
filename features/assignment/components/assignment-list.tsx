"use client";

import * as React from "react";
import { useState } from "react";
import { useGetAssignments } from "../api/use-get-assignments";
import { useDeleteAssignment } from "../api/use-delete-assignment";
import { CreateAssignmentDialog } from "./create-assignment-dialog";
import { SubmitAssignmentDialog } from "./submit-assignment-dialog";
import { GradeAssignmentDialog } from "./grade-assignment-dialog";
import { AssignmentForm } from "./assignment-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useGetUser } from "@/features/auth/api/use-get-user";

interface AssignmentListProps {
  subjectId: string;
}

type Assignment = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  hasGrade: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  assignmentCourseSubjects?: Array<{
    courseSubject: {
      id: string;
      course: {
        id: string;
        name: string;
      };
    };
  }>;
  submissions?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    submittedAt: string;
    grade?: number | null;
    feedback?: string | null;
    student: {
      id: string;
      name: string;
      dni: string;
      email: string;
    };
  }>;
};

export function AssignmentList({ subjectId }: AssignmentListProps) {
  const { assignments, isLoading } = useGetAssignments(subjectId);
  const { deleteAssignment } = useDeleteAssignment();
  const { user } = useGetUser();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<{
    id: string;
    grade?: number | null;
    feedback?: string | null;
    hasGrade: boolean;
  } | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";

  const handleDelete = async () => {
    if (deletingAssignment) {
      await deleteAssignment({
        id: deletingAssignment.id,
        subjectId,
      });
      setDeletingAssignment(null);
    }
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (!isStudent || !assignment.submissions || assignment.submissions.length === 0) {
      return null;
    }
    const submission = assignment.submissions[0];
    const dueDate = new Date(assignment.dueDate);
    const submittedAt = new Date(submission.submittedAt);
    const isLate = submittedAt > dueDate;
    return { submission, isLate };
  };

  const isPastDue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Entregas</CardTitle>
              <CardDescription>
                {isTeacher
                  ? "Gestiona las entregas de esta materia"
                  : "Visualiza y entrega tus trabajos"}
              </CardDescription>
            </div>
            {isTeacher && (
              <CreateAssignmentDialog subjectId={subjectId} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!assignments || (assignments as any[]).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay entregas disponibles
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha de Entrega</TableHead>
                  <TableHead>Estado</TableHead>
                  {isTeacher && <TableHead>Entregas</TableHead>}
                  {isStudent && <TableHead>Mi Entrega</TableHead>}
                  {isTeacher && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(assignments as any[]).map((assignment: Assignment) => {
                  const submissionStatus = getSubmissionStatus(assignment);
                  const pastDue = isPastDue(assignment.dueDate);

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{assignment.title}</div>
                          {assignment.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {assignment.description}
                            </div>
                          )}
                          {isTeacher && assignment.assignmentCourseSubjects && assignment.assignmentCourseSubjects.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {assignment.assignmentCourseSubjects.map((acs) => (
                                <Badge key={acs.courseSubject.id} variant="outline" className="text-xs">
                                  {acs.courseSubject.course.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(assignment.dueDate), "PPp")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pastDue ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Vencida
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      {isTeacher && (
                        <TableCell>
                          {assignment.submissions && assignment.submissions.length > 0 ? (
                            <div className="space-y-2">
                              {assignment.submissions.map((submission) => (
                                <div
                                  key={submission.id}
                                  className="flex items-center justify-between gap-2 text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{submission.student.name}</div>
                                    <a
                                      href={submission.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      {submission.fileName}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {submission.grade !== null && submission.grade !== undefined ? (
                                      <Badge variant="default">
                                        {submission.grade}/100
                                      </Badge>
                                    ) : assignment.hasGrade ? (
                                      <Badge variant="outline">Sin calificar</Badge>
                                    ) : null}
                                    {assignment.hasGrade && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setGradingSubmission({
                                            id: submission.id,
                                            grade: submission.grade,
                                            feedback: submission.feedback,
                                            hasGrade: assignment.hasGrade,
                                          })
                                        }
                                      >
                                        Calificar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Sin entregas
                            </span>
                          )}
                        </TableCell>
                      )}
                      {isStudent && (
                        <TableCell>
                          {submissionStatus ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Entregado</span>
                              </div>
                              {submissionStatus.isLate && (
                                <Badge variant="destructive" className="text-xs">
                                  Tarde
                                </Badge>
                              )}
                              {submissionStatus.submission.grade !== null &&
                                submissionStatus.submission.grade !== undefined && (
                                  <div className="text-sm font-medium">
                                    Calificación: {submissionStatus.submission.grade}/100
                                  </div>
                                )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSubmittingAssignmentId(assignment.id)}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Subir
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {isTeacher && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingAssignment(assignment)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingAssignment(assignment)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingAssignment && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Editar Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignmentForm
              initialData={editingAssignment}
              subjectId={subjectId}
              onSuccess={() => setEditingAssignment(null)}
            />
          </CardContent>
        </Card>
      )}

      {submittingAssignmentId && (
        <SubmitAssignmentDialog
          open={!!submittingAssignmentId}
          onOpenChange={(open) => !open && setSubmittingAssignmentId(null)}
          assignmentId={submittingAssignmentId}
        />
      )}

      {gradingSubmission && (
        <GradeAssignmentDialog
          open={!!gradingSubmission}
          onOpenChange={(open) => !open && setGradingSubmission(null)}
          submissionId={gradingSubmission.id}
          currentGrade={gradingSubmission.grade}
          currentFeedback={gradingSubmission.feedback}
          hasGrade={gradingSubmission.hasGrade}
        />
      )}

      <AlertDialog
        open={!!deletingAssignment}
        onOpenChange={(open) => !open && setDeletingAssignment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la entrega y todas
              las entregas de estudiantes asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
