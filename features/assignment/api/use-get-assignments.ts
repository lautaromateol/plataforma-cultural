import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

const getEndpoint = () => (client.api as any).assignment["subject"][":subjectId"]["$get"];
type GetAssignmentsEndpoint = ReturnType<typeof getEndpoint>;
type GetAssignmentsResponse = Awaited<ReturnType<GetAssignmentsEndpoint>>;
type GetAssignmentsJson = Awaited<ReturnType<GetAssignmentsResponse["json"]>>;

type SuccessResponse = Extract<GetAssignmentsJson, { assignments: unknown }>;
type ErrorResponse = Extract<GetAssignmentsJson, { message: string }>;

export function useGetAssignments(subjectId: string | null) {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery<SuccessResponse, Error>({
    queryKey: ["assignments", subjectId],
    queryFn: async () => {
      if (!subjectId) {
        throw new Error("subjectId es requerido");
      }

      const response = await (client.api as any).assignment["subject"][":subjectId"].$get({
        param: { subjectId },
      });

      const jsonData = (await response.json()) as unknown as GetAssignmentsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener entregas");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    enabled: !!subjectId,
  });

  return {
    assignments: data?.assignments,
    error,
    isLoading,
    isError,
    refetch,
  };
}
