import z from "zod";

export const signInSchema = z
  .object({
    email: z.email().optional(),
    dni: z
      .string()
      .max(8, { message: "El DNI no puede exceder los 8 caracteres." })
      .optional(),
    password: z
      .string()
      .min(8, {
        message:
          "La contraseña debe tener un minimo de 8 caracteres y un maximo de 20",
      })
      .max(20, {
        message:
          "La contraseña debe tener un minimo de 8 caracteres y un maximo de 20",
      }),
  })
  .refine((data) => (data.email ? !data.dni : data.dni), {
    path: ["email", "dni"],
    message: "Debes ingresar **solo** email o **solo** DNI para autenticarte",
  });

export const createMailSchema = z.object({
  email: z.email(),
  dni: z
    .string()
    .max(8, { message: "El DNI no puede exceder los 8 caracteres." }),
  password: z
    .string()
    .min(8, {
      message:
        "La contraseña debe tener un minimo de 8 caracteres y un maximo de 20",
    })
    .max(20, {
      message:
        "La contraseña debe tener un minimo de 8 caracteres y un maximo de 20",
    }),
});

export const resendMailSchema = z
  .object({
    email: z.email().optional(),
    dni: z
      .string()
      .max(8, { message: "El DNI no puede exceder los 8 caracteres." })
      .optional(),
  })
  .refine((data) => (data.email ? !data.dni : data.dni), {
    path: ["email", "dni"],
    message: "Debes ingresar **solo** email o **solo** DNI para autenticarte",
  });