import z from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  academicYear: z.string().min(4, "Año académico requerido"),
  capacity: z.number().min(1),
  classroom: z.string().optional(),
  shift: z.string().optional(),
  levelId: z.string().min(1, "ID del nivel requerido"),
});

// Para actualización, permitimos que todos los campos sean opcionales
// levelId no se requiere ni se valida porque está deshabilitado en el formulario
export const updateCourseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  academicYear: z.string().min(4, "Año académico requerido").optional(),
  capacity: z.number().min(1).optional(),
  classroom: z.string().optional(),
  shift: z.string().optional(),
  levelId: z.any().optional(), // Acepta cualquier valor sin validar
});

export type Course = z.infer<typeof createCourseSchema> & {
  id: string;
};