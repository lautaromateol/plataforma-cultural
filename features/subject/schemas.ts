import z from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().optional(),
  description: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type Subject = {
  courses: {
    id: string;
    name: string;
    academicYear: string;
  }[];
  courseSubjects: {
    course: {
      id: string;
      name: string;
      academicYear: string;
    };
    id: string;
    createdAt: string;
    updatedAt: string;
    courseId: string;
    schedule: string | null;
    subjectId: string;
    teacherId: string | null;
  }[];
  code: string | null;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  yearId: string;
  description: string | null;
}