import z from "zod";

export const publicStudentProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  dni: z.string(),
  birthDate: z.date().nullable(),
  phone: z.string().nullable(),
});

export type PublicStudentProfile = z.infer<typeof publicStudentProfileSchema>;
