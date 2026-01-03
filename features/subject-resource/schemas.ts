import z from "zod";

export const createResourceSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "La materia es requerida"),
  fileName: z.string().min(1, "El nombre del archivo es requerido"),
  fileUrl: z.string().min(1, "La URL del archivo es requerida"),
  fileType: z.string().min(1, "El tipo de archivo es requerido"),
  fileSize: z.number().min(1, "El tamaño del archivo debe ser mayor a 0"),
});

export const updateResourceSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  description: z.string().optional(),
});

export const deleteResourceSchema = z.object({
  id: z.string().min(1, "El ID es requerido"),
});

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>;
export type UpdateResourceFormValues = z.infer<typeof updateResourceSchema>;

