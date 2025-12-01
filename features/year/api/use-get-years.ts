import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type Year = {
  id: string;
  level: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  subjects?: any[];
  courses?: any[];
};

type YearsResponse = {
  years: Year[];
  message?: string;
  status?: number;
};

export function useGetYears() {
  const query = useQuery<Year[], Error>({
    queryKey: ["years"],
    queryFn: async () => {
      const response = await client.api.admin["academic-year"].$get();
      const data = await response.json();
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener los años");
        (error as any).status = response.status;
        throw error;
      }
      return data.years;
    },
  });
  return {
    years: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
