import z from "zod";

export const createCourseSubjectSchema = z.object({
  courseId: z.string().min(1, "ID del curso requerido"),
  subjectId: z.string().min(1, "ID de la materia requerida"),
  teacherId: z.string().optional(),
  schedule: z.string().optional(),
});

export const updateCourseSubjectSchema = createCourseSubjectSchema.partial();