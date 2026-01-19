import z from "zod";

export const createAnnouncementSchema = z.object({
    message: z.string().min(1, { message: "No puedes enviar un anuncio vacío." }).max(300, { message: "Ingresa un maximo de 300 caracteres." }),
})