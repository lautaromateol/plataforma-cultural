import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetYearsEndpoint = (typeof client.api.admin)["academic-year"]["$get"];
type GetYearsResponse = Awaited<ReturnType<GetYearsEndpoint>>;
type GetYearsJson = Awaited<ReturnType<GetYearsResponse["json"]>>;

type SuccessResponse = Extract<GetYearsJson, { years: unknown }>;
type ErrorResponse = Extract<GetYearsJson, { message: string }>;

// Tipo exportado para uso en componentes
export type Year = NonNullable<SuccessResponse["years"]>[number];

export function useGetYears() {
  const query = useQuery<Year[], Error>({
    queryKey: ["years"],
    queryFn: async () => {
      const response = await client.api.admin["academic-year"].$get();
      const jsonData = (await response.json()) as unknown as GetYearsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los años"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.years;
    },
  });

  return {
    years: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
