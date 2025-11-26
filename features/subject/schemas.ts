import z from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().optional(),
  description: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();