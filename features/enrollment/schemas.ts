import z from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "ID del estudiante requerido"),
  courseId: z.string().min(1, "ID del curso requerido"),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED"]).default("ACTIVE"),
});

export const updateEnrollmentSchema = createEnrollmentSchema.partial();