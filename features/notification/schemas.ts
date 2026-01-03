import z from "zod";

export const markAsReadSchema = z.object({
  notificationId: z.string().min(1, "El ID de la notificación es requerido"),
});

export type MarkAsReadFormValues = z.infer<typeof markAsReadSchema>;
