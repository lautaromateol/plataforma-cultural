import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetLevelsEndpoint = (typeof client.api.admin)["level"]["$get"];
type GetLevelsResponse = Awaited<ReturnType<GetLevelsEndpoint>>;
type GetLevelsJson = Awaited<ReturnType<GetLevelsResponse["json"]>>;

type SuccessResponse = Extract<GetLevelsJson, { levels: unknown }>;
type ErrorResponse = Extract<GetLevelsJson, { message: string }>;

export type Level = NonNullable<SuccessResponse["levels"]>[number];

type UseGetLevelsParams = {
  studyPlanId?: string;
};

export function useGetLevels(params: UseGetLevelsParams = {}) {
  const query = useQuery<Level[], Error>({
    queryKey: ["levels", params],
    queryFn: async () => {
      const response = await client.api.admin.level.$get({
        query: params.studyPlanId ? { studyPlanId: params.studyPlanId } : {},
      });
      const jsonData = (await response.json()) as unknown as GetLevelsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los niveles"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.levels;
    },
  });

  return {
    levels: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
