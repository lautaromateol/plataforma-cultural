import z from "zod";

export const createAssignmentSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  dueDate: z.string().datetime("Fecha de entrega inválida"),
  hasGrade: z.boolean(),
  courseSubjectIds: z.array(z.string().min(1)).min(1, "Debes seleccionar al menos un curso"),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, "El ID de la entrega es requerido"),
  fileName: z.string().min(1, "El nombre del archivo es requerido"),
  fileUrl: z.string().min(1, "La URL del archivo es requerida"),
  fileType: z.string().min(1, "El tipo de archivo es requerido"),
  fileSize: z.number().min(1, "El tamaño del archivo debe ser mayor a 0"),
});

export const gradeAssignmentSchema = z.object({
  submissionId: z.string().min(1, "El ID de la entrega es requerido"),
  grade: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentFormValues = z.infer<typeof updateAssignmentSchema>;
export type SubmitAssignmentFormValues = z.infer<typeof submitAssignmentSchema>;
export type GradeAssignmentFormValues = z.infer<typeof gradeAssignmentSchema>;
