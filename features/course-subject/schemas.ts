import z from "zod";

export const createCourseSubjectSchema = z.object({
  courseId: z.string().min(1, "ID del curso requerido"),
  subjectId: z.string().min(1, "ID de la materia requerida"),
  teacherId: z.string().optional(),
  schedule: z.string().optional(),
});

export const updateCourseSubjectSchema = createCourseSubjectSchema.partial();

// Schema para el formulario de asignación de profesor
export const assignTeacherFormSchema = z.object({
  teacherId: z.string().min(1, "Debes seleccionar un profesor"),
  schedule: z.string().optional(),
});

export type AssignTeacherFormValues = z.infer<typeof assignTeacherFormSchema>;