import z from "zod"

// Schema para crear un cuestionario
export const createQuizSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  timeLimit: z.number().min(1, "El tiempo límite debe ser mayor a 0"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  allowReview: z.boolean(),
  allowRetries: z.boolean(),
  subjectId: z.string().min(1, "La materia es requerida"),
  questions: z.array(z.object({
    statement: z.string().min(1, "El enunciado es requerido"),
    type: z.enum(["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE"]),
    hasAutoCorrection: z.boolean(),
    points: z.number().min(0),
    order: z.number().min(0),
    options: z.array(z.object({
      text: z.string().min(1, "El texto de la opción es requerido"),
      isCorrect: z.boolean(),
      order: z.number().min(0),
    })).optional(),
    correctTextAnswer: z.string().optional().or(z.literal("")), // Para respuesta abierta con corrección automática
  })).min(1, "Debe haber al menos una pregunta"),
}).refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return endDate > startDate
}, {
  message: "La fecha de cierre debe ser posterior a la fecha de inicio",
  path: ["endDate"],
})

// Schema para actualizar un cuestionario
export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  allowReview: z.boolean().optional(),
  allowRetries: z.boolean().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    return endDate > startDate
  }
  return true
}, {
  message: "La fecha de cierre debe ser posterior a la fecha de inicio",
  path: ["endDate"],
})

// Schema para iniciar un intento
export const startQuizAttemptSchema = z.object({
  quizId: z.string().min(1, "El ID del cuestionario es requerido"),
})

// Schema para enviar una respuesta
export const submitAnswerSchema = z.object({
  questionId: z.string().min(1, "El ID de la pregunta es requerido"),
  attemptId: z.string().min(1, "El ID del intento es requerido"),
  textAnswer: z.string().optional(),
  selectedOptionIds: z.array(z.string()).optional(),
})

// Schema para enviar el cuestionario completo
// Nota: attemptId viene del parámetro de la ruta, no del JSON
export const submitQuizAttemptSchema = z.object({
  timeRemaining: z.number().optional(),
})

// Schema para corregir manualmente una respuesta
export const correctAnswerSchema = z.object({
  answerId: z.string().min(1, "El ID de la respuesta es requerido"),
  points: z.number().min(0),
  isCorrect: z.boolean(),
})

// Schema para corregir manualmente un intento completo
export const correctAttemptSchema = z.object({
  attemptId: z.string().min(1, "El ID del intento es requerido"),
  corrections: z.array(z.object({
    answerId: z.string(),
    points: z.number().min(0),
    isCorrect: z.boolean(),
  })),
})

// Tipos inferidos
export type CreateQuizFormValues = z.infer<typeof createQuizSchema>
export type UpdateQuizFormValues = z.infer<typeof updateQuizSchema>
export type StartQuizAttemptFormValues = z.infer<typeof startQuizAttemptSchema>
export type SubmitAnswerFormValues = z.infer<typeof submitAnswerSchema>
export type SubmitQuizAttemptFormValues = z.infer<typeof submitQuizAttemptSchema>
export type CorrectAnswerFormValues = z.infer<typeof correctAnswerSchema>
export type CorrectAttemptFormValues = z.infer<typeof correctAttemptSchema>
