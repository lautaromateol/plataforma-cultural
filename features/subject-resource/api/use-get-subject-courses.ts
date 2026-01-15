import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos para obtener cursos de una materia
const getEndpoint = () => (client.api as any)["subject-info"]["courses"][":subjectId"]["$get"];
type GetCoursesEndpoint = ReturnType<typeof getEndpoint>;
type GetCoursesResponse = Awaited<ReturnType<GetCoursesEndpoint>>;
type GetCoursesJson = Awaited<ReturnType<GetCoursesResponse["json"]>>;

type SuccessResponse = Extract<GetCoursesJson, { courses: unknown }>;
type ErrorResponse = Extract<GetCoursesJson, { message: string }>;

export type SubjectCourse = SuccessResponse["courses"][number];

export function useGetSubjectCourses(subjectId: string) {
  const query = useQuery<SubjectCourse[], Error>({
    queryKey: ["subject-courses", subjectId],
    queryFn: async () => {
      const response = await (client.api as any)["subject-info"]["courses"][":subjectId"].$get({
        param: { subjectId },
      });

      const jsonData = (await response.json()) as unknown as GetCoursesJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener cursos");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.courses;
    },
    enabled: !!subjectId,
  });

  return {
    data: query.data || [],
    isPending: query.isPending,
    error: query.error,
  };
}
