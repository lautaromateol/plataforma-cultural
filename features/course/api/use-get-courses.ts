import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetCoursesEndpoint = (typeof client.api.admin.course)["$get"];
type GetCoursesResponse = Awaited<ReturnType<GetCoursesEndpoint>>;
type GetCoursesJson = Awaited<ReturnType<GetCoursesResponse["json"]>>;

type SuccessResponse = Extract<GetCoursesJson, { courses: unknown }>;
type ErrorResponse = Extract<GetCoursesJson, { message: string }>;

// Tipo exportado para uso en componentes
export type Course = NonNullable<SuccessResponse["courses"]>[number];

type UseGetCoursesParams = {
  academicYear?: string;
  levelId?: string;
};

export function useGetCourses(params?: UseGetCoursesParams) {
  const query = useQuery<Course[], Error>({
    queryKey: ["courses", params?.academicYear, params?.levelId],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.academicYear) queryParams.academicYear = params.academicYear;
      if (params?.levelId) queryParams.levelId = params.levelId;

      const response = await client.api.admin.course.$get({
        query: queryParams,
      });

      const jsonData = (await response.json()) as unknown as GetCoursesJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los cursos"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.courses;
    },
  });

  return {
    courses: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

