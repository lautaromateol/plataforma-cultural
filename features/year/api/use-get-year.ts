import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetYearEndpoint = (typeof client.api.admin)["academic-year"][":id"]["$get"];
type GetYearResponse = Awaited<ReturnType<GetYearEndpoint>>;
type GetYearJson = Awaited<ReturnType<GetYearResponse["json"]>>;

type SuccessResponse = Extract<GetYearJson, { year: unknown }>;
type ErrorResponse = Extract<GetYearJson, { message: string }>;

// Tipo exportado para uso en componentes
export type YearDetails = NonNullable<SuccessResponse["year"]>;

// NOTA:
// Para revalidar el detalle de un año inmediatamente después de actualizaciones o borrados,
// llama: queryClient.invalidateQueries({ queryKey: ["year", id] }), por ejemplo, desde onSuccess de update/delete.
// Aquí no se programa, pero la key se mantiene consistente.
export function useGetYear(id: string) {
  const query = useQuery<YearDetails | undefined, Error>({
    queryKey: ["year", id],
    queryFn: async () => {
      const response = await client.api.admin["academic-year"][":id"].$get({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as GetYearJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener el año");
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.year;
    },
    enabled: !!id,
  });

  return {
    year: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
