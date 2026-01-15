import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos para obtener profesores de una materia
const getEndpoint = () => (client.api as any)["subject-info"]["teachers"][":subjectId"]["$get"];
type GetTeachersEndpoint = ReturnType<typeof getEndpoint>;
type GetTeachersResponse = Awaited<ReturnType<GetTeachersEndpoint>>;
type GetTeachersJson = Awaited<ReturnType<GetTeachersResponse["json"]>>;

type SuccessResponse = Extract<GetTeachersJson, { teachers: unknown }>;
type ErrorResponse = Extract<GetTeachersJson, { message: string }>;

export type Teacher = SuccessResponse["teachers"][number];

export function useGetSubjectTeachers(subjectId: string) {
  const query = useQuery<Teacher[], Error>({
    queryKey: ["subject-teachers", subjectId],
    queryFn: async () => {
      const response = await (client.api as any)["subject-info"]["teachers"][":subjectId"].$get({
        param: { subjectId },
      });

      const jsonData = (await response.json()) as unknown as GetTeachersJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener profesores");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.teachers;
    },
    enabled: !!subjectId,
  });

  return {
    data: query.data || [],
    isPending: query.isPending,
    error: query.error,
  };
}
