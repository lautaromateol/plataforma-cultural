import z from "zod";

export const createUserSchema = z.object({
  dni: z.string().min(1, "DNI requerido"),
  email: z.string().email("Email inválido").nullable(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "Nombre requerido"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
});

export const updateUserSchema = z.object({
  dni: z.string().min(1, "DNI requerido"),
  email: z.string().email("Email inválido").nullable(),
  password: z.string().refine(
    (val) => !val || val.length >= 6,
    "La contraseña debe tener al menos 6 caracteres"
  ).optional(),
  name: z.string().min(1, "Nombre requerido"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
}).partial()

type User = z.infer<typeof createUserSchema> & {
  id: string;
} 

export type CampusUser = Omit<User, "password">