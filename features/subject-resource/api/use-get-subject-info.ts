import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos para la información básica de una materia
const getEndpoint = () => (client.api as any)["subject-info"][":subjectId"]["$get"];
type GetSubjectInfoEndpoint = ReturnType<typeof getEndpoint>;
type GetSubjectInfoResponse = Awaited<ReturnType<GetSubjectInfoEndpoint>>;
type GetSubjectInfoJson = Awaited<ReturnType<GetSubjectInfoResponse["json"]>>;

type SuccessResponse = Extract<GetSubjectInfoJson, { subject: unknown }>;
type ErrorResponse = Extract<GetSubjectInfoJson, { message: string }>;

export type SubjectInfo = SuccessResponse;

export function useGetSubjectInfo(subjectId: string) {
  const query = useQuery<SubjectInfo, Error>({
    queryKey: ["subject-info", subjectId],
    queryFn: async () => {
      const response = await (client.api as any)["subject-info"][":subjectId"].$get({
        param: { subjectId },
      });

      const jsonData = (await response.json()) as unknown as GetSubjectInfoJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener información de la materia");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    enabled: !!subjectId,
  });

  return {
    data: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
