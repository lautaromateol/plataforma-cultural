import z from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  academicYear: z.string().min(4, "Año académico requerido"),
  capacity: z.number().min(1),
  classroom: z.string().optional(),
  yearId: z.string().min(1, "ID del año requerido"),
});

export const updateCourseSchema = createCourseSchema.partial();