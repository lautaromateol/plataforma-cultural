import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetYearDetailsEndpoint = (typeof client.api.admin)["academic-year"]["level"][":level"]["$get"];
type GetYearDetailsResponse = Awaited<ReturnType<GetYearDetailsEndpoint>>;
type GetYearDetailsJson = Awaited<ReturnType<GetYearDetailsResponse["json"]>>;

type SuccessResponse = Extract<GetYearDetailsJson, { year: unknown }>;
type ErrorResponse = Extract<GetYearDetailsJson, { message: string }>;

// Tipos exportados para uso en componentes
export type YearDetailsResponse = SuccessResponse;

export function useGetYearDetails(level: number) {
  const query = useQuery<YearDetailsResponse, Error>({
    queryKey: ["year-details", level],
    queryFn: async () => {
      const response = await client.api.admin["academic-year"].level[":level"].$get({
        param: { level: level.toString() },
      });

      const jsonData = (await response.json()) as unknown as GetYearDetailsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los detalles del año"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    enabled: level >= 1 && level <= 6,
  });

  return {
    yearDetails: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

