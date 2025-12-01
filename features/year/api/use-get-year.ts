import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// NOTA:
// Para revalidar el detalle de un año inmediatamente después de actualizaciones o borrados,
// llama: queryClient.invalidateQueries({ queryKey: ["year", id] }), por ejemplo, desde onSuccess de update/delete.
// Aquí no se programa, pero la key se mantiene consistente.
type YearDetails = {
  id: string;
  level: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  subjects?: any[];
  courses?: any[];
};

type YearResponse = {
  year?: YearDetails;
  message?: string;
  status?: number;
};

export function useGetYear(id: string) {
  const query = useQuery<YearDetails | undefined, Error>({
    queryKey: ["year", id],
    queryFn: async () => {
      const response = await client.api.admin["academic-year"]
        [":id"]
        .$get({ param: { id } });
      const data = await response.json();
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener el año");
        (error as any).status = response.status;
        throw error;
      }
      return data.year;
    },
    enabled: !!id,
  });
  return {
    year: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
