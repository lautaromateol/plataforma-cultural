import { z } from "zod";

export const createStudyPlanSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido").max(10),
  description: z.string().optional(),
  durationYears: z.number().min(1).max(10),
  targetAudience: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateStudyPlanSchema = createStudyPlanSchema.partial();

export interface StudyPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  durationYears: number;
  targetAudience: string | null;
  isActive: boolean;
  levels?: Level[];
}

export interface Level {
  id: string;
  order: number;
  name: string;
  description: string | null;
  studyPlanId: string;
  studyPlan?: StudyPlan;
}
