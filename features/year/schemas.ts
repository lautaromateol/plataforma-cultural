import { z } from "zod";

export const createYearSchema = z.object({
  level: z.number().min(1).max(6),
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
});

export const updateYearSchema = createYearSchema.partial();
export interface Year {
  id: string;
  level: number;
  name: string;
  description: string | null;
}
