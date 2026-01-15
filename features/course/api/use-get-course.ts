import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetCourseEndpoint = (typeof client.api.admin.course)[":id"]["$get"];
type GetCourseResponse = Awaited<ReturnType<GetCourseEndpoint>>;
type GetCourseJson = Awaited<ReturnType<GetCourseResponse["json"]>>;

// El tipo puede ser una unión, extraer el tipo exitoso
type SuccessResponse = Extract<GetCourseJson, { course: unknown }>;
type ErrorResponse = Extract<GetCourseJson, { message: string }>;

// Extraer el tipo del curso desde la respuesta exitosa
export type CourseDetails = NonNullable<SuccessResponse["course"]>;

export function useGetCourse(id: string) {
  const query = useQuery<CourseDetails | undefined, Error>({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await client.api.admin.course[":id"].$get({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as GetCourseJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener el curso"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      if (!successData.course) {
        throw new Error("Curso no encontrado");
      }

      const course = successData.course;

      return course;
    },
    enabled: !!id,
  });

  return {
    course: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
