import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Hack para acceder a rutas con guiones: definimos una función que devuelve el endpoint
const getEndpoint = () => (client.api as any)["subject-resource"][":subjectId"]["$get"];
type GetResourcesEndpoint = ReturnType<typeof getEndpoint>;
type GetResourcesResponse = Awaited<ReturnType<GetResourcesEndpoint>>;
type GetResourcesJson = Awaited<ReturnType<GetResourcesResponse["json"]>>;

type SuccessResponse = Extract<GetResourcesJson, { resources: unknown }>;
type ErrorResponse = Extract<GetResourcesJson, { message: string }>;

export function useGetResources(subjectId: string) {
  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["subject-resources", subjectId],
    queryFn: async () => {
      const response = await (client.api as any)["subject-resource"][":subjectId"].$get({
        param: { subjectId },
      });

      const jsonData = (await response.json()) as unknown as GetResourcesJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener recursos");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    enabled: !!subjectId,
  });

  return {
    resources: query.data?.resources,
    isPending: query.isPending,
    error: query.error,
  };
}
