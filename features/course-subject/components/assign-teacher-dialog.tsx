"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import {
  AssignTeacherForm,
  type SubjectInfo,
} from "./assign-teacher-form";
import { useAssignTeacher } from "../api/use-assign-teacher";
import { useUpdateAssignment } from "../api/use-update-assignment";
import type { AssignTeacherFormValues } from "../schemas";

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectInfo | null;
  courseId: string;
}

export function AssignTeacherDialog({
  open,
  onOpenChange,
  subject,
  courseId,
}: AssignTeacherDialogProps) {
  const { assignTeacher, isPending: isAssigning } = useAssignTeacher(courseId);
  const { updateAssignment, isPending: isUpdating } =
    useUpdateAssignment(courseId);

  if (!subject) return null;

  const isEdit = !!subject.courseSubjectId;
  const isPending = isAssigning || isUpdating;

  const handleSubmit = (data: AssignTeacherFormValues) => {
    if (subject.courseSubjectId) {
      // Actualizar asignación existente
      updateAssignment(
        {
          id: subject.courseSubjectId,
          data: {
            teacherId: data.teacherId || undefined,
            schedule: data.schedule || undefined,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      // Crear nueva asignación
      assignTeacher(
        {
          courseId,
          subjectId: subject.id,
          teacherId: data.teacherId || undefined,
          schedule: data.schedule || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {isEdit ? "Editar Asignación" : "Asignar Profesor"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Modificar la asignación de profesor para ${subject.name}`
              : `Selecciona un profesor para la materia ${subject.name}`}
          </DialogDescription>
        </DialogHeader>

        <AssignTeacherForm
          subject={subject}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

