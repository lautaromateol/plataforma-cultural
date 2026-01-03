import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

const getEndpoint = () => (client.api as any).assignment["detail"][":id"]["$get"];
type GetAssignmentEndpoint = ReturnType<typeof getEndpoint>;
type GetAssignmentResponse = Awaited<ReturnType<GetAssignmentEndpoint>>;
type GetAssignmentJson = Awaited<ReturnType<GetAssignmentResponse["json"]>>;

type SuccessResponse = Extract<GetAssignmentJson, { assignment: unknown }>;
type ErrorResponse = Extract<GetAssignmentJson, { message: string }>;

export function useGetAssignment(id: string | null) {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery<SuccessResponse, Error>({
    queryKey: ["assignment", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID es requerido");
      }

      const response = await (client.api as any).assignment["detail"][":id"].$get({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as GetAssignmentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener la entrega");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    enabled: !!id,
  });

  return {
    assignment: data?.assignment,
    error,
    isLoading,
    isError,
    refetch,
  };
}
