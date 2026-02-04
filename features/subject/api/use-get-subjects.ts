import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetSubjectsEndpoint = (typeof client.api.admin.subject)["$get"];
type GetSubjectsResponse = Awaited<ReturnType<GetSubjectsEndpoint>>;
type GetSubjectsJson = Awaited<ReturnType<GetSubjectsResponse["json"]>>;

type SuccessResponse = Extract<GetSubjectsJson, { subjects: unknown }>;
type ErrorResponse = Extract<GetSubjectsJson, { message: string }>;

// Tipo exportado para uso en componentes
export type Subject = NonNullable<SuccessResponse["subjects"]>[number];
type UseGetSubjectsParams = {
  levelId?: string;
};

export function useGetSubjects(params?: UseGetSubjectsParams) {
  const query = useQuery<Subject[], Error>({
    queryKey: ["subjects", params?.levelId],
    queryFn: async () => {
      const response = await client.api.admin.subject.$get({
        query: {
          levelId: params?.levelId,
        }
      });
      const jsonData = (await response.json()) as unknown as GetSubjectsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener las materias"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.subjects;
    },
  });

  return {
    subjects: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

