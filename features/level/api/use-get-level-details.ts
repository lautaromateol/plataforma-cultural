import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetLevelEndpoint = (typeof client.api.admin)["level"][":id"]["$get"];
type GetLevelResponse = Awaited<ReturnType<GetLevelEndpoint>>;
type GetLevelJson = Awaited<ReturnType<GetLevelResponse["json"]>>;

type SuccessResponse = Extract<GetLevelJson, { level: unknown }>;
type ErrorResponse = Extract<GetLevelJson, { message: string }>;

export type LevelDetailsResponse = SuccessResponse;

export function useGetLevelDetails(id: string | undefined) {
  const query = useQuery<LevelDetailsResponse, Error>({
    queryKey: ["level-details", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await client.api.admin.level[":id"].$get({
        param: { id: id! },
      });

      const jsonData = (await response.json()) as unknown as GetLevelJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los detalles del nivel"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
  });

  return {
    levelDetails: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
