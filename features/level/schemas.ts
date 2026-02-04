import { z } from "zod";

export const createLevelSchema = z.object({
  order: z.number().min(1, "El orden debe ser mayor a 0"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  studyPlanId: z.string().min(1, "El plan de estudio es requerido"),
});

export const updateLevelSchema = createLevelSchema.partial();

export interface Level {
  id: string;
  order: number;
  name: string;
  description: string | null;
  studyPlanId: string;
  studyPlan?: {
    id: string;
    name: string;
    code: string;
  };
}
