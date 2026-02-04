import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetStudentsEndpoint = (typeof client.api.admin.users.students)["$get"];
type GetStudentsResponse = Awaited<ReturnType<GetStudentsEndpoint>>;
type GetStudentsJson = Awaited<ReturnType<GetStudentsResponse["json"]>>;

type SuccessResponse = Extract<GetStudentsJson, { students: unknown }>;
type ErrorResponse = Extract<GetStudentsJson, { message: string }>;

// Tipo exportado para uso en componentes
export type Student = NonNullable<SuccessResponse["students"]>[number];
type useGetStudentsParams = {
  levelId?: string;
}

export function useGetStudents(params?: useGetStudentsParams) {
  const query = useQuery<Student[], Error>({
    queryKey: ["students", params?.levelId],
    queryFn: async () => {
      const response = await client.api.admin.users.students.$get({
        query: { levelId: params?.levelId },
      });

      const jsonData = (await response.json()) as unknown as GetStudentsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los estudiantes"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.students;
    },
  });

  return {
    students: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

