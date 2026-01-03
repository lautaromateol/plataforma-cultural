import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetSubjectEndpoint = (typeof client.api.admin.subject)[":id"]["$get"];
type GetSubjectResponse = Awaited<ReturnType<GetSubjectEndpoint>>;
type GetSubjectJson = Awaited<ReturnType<GetSubjectResponse["json"]>>;

type SuccessResponse = Extract<GetSubjectJson, { subject: unknown }>;
type ErrorResponse = Extract<GetSubjectJson, { message: string }>;

// Tipo exportado para uso en componentes
export type SubjectDetails = NonNullable<SuccessResponse["subject"]>;

export function useGetSubject(id: string) {
  const query = useQuery<SubjectDetails | undefined, Error>({
    queryKey: ["subject", id],
    queryFn: async () => {
      const response = await client.api.admin.subject[":id"].$get({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as GetSubjectJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener la materia"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.subject;
    },
    enabled: !!id,
  });

  return {
    subject: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

