import z from "zod";

export const publicStudentProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  dni: z.string(),
  birthDate: z.date().nullable(),
  phone: z.string().nullable(),
  guardianName: z.string().nullable(),
  guardianPhone: z.string().nullable(),
});

export const updateStudentProfileSchema = z.object({
  birthDate: z.string().nullable(),
  phone: z.string().nullable(),
  guardianName: z.string().nullable(),
  guardianPhone: z.string().nullable(),
});

export type PublicStudentProfile = z.infer<typeof publicStudentProfileSchema>;
export type UpdateStudentProfile = z.infer<typeof updateStudentProfileSchema>;