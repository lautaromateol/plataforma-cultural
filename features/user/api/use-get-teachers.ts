import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetTeachersEndpoint = (typeof client.api.admin.users.teachers)["$get"];
type GetTeachersResponse = Awaited<ReturnType<GetTeachersEndpoint>>;
type GetTeachersJson = Awaited<ReturnType<GetTeachersResponse["json"]>>;

type SuccessResponse = Extract<GetTeachersJson, { teachers: unknown }>;
type ErrorResponse = Extract<GetTeachersJson, { message: string }>;

// Tipo exportado para uso en componentes
export type Teacher = NonNullable<SuccessResponse["teachers"]>[number];
type UseGetTeachersParams = {
  yearId?: string;
};

export function useGetTeachers(params?: UseGetTeachersParams) {
  const query = useQuery<Teacher[], Error>({
    queryKey: ["teachers", params?.yearId],
    queryFn: async () => {
      const response = await client.api.admin.users.teachers.$get({
        query: { yearId: params?.yearId }
      });

      const jsonData = (await response.json()) as unknown as GetTeachersJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los profesores"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.teachers;
    },
  });

  return {
    teachers: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

