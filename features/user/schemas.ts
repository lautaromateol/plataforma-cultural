import z from "zod";

export const createUserSchema = z.object({
  dni: z.string().min(1, "DNI requerido"),
  email: z.string().email("Email inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "Nombre requerido"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
});

export const updateUserSchema = createUserSchema.partial();