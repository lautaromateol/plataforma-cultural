import { z } from "zod"

export const updateQuizGradeSchema = z.object({
  attemptId: z.string().min(1, "El ID del intento es requerido"),
  answerId: z.string().min(1, "El ID de la respuesta es requerido"),
  points: z.number().min(0, "Los puntos deben ser mayor o igual a 0"),
  isCorrect: z.boolean(),
})

export const updateAssignmentGradeSchema = z.object({
  submissionId: z.string().min(1, "El ID de la entrega es requerido"),
  grade: z.number().min(0, "La calificación debe ser mayor o igual a 0").max(10, "La calificación no puede ser mayor a 10"),
  feedback: z.string().optional(),
})

export const getGradesQuerySchema = z.object({
  levelId: z.string().optional(),
  courseId: z.string().optional(),
})

export type UpdateQuizGradeInput = z.infer<typeof updateQuizGradeSchema>
export type UpdateAssignmentGradeInput = z.infer<typeof updateAssignmentGradeSchema>
export type GetGradesQuery = z.infer<typeof getGradesQuerySchema>
