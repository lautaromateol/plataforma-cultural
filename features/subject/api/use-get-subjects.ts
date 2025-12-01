import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type Subject = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  yearId: string;
  createdAt: string;
  updatedAt: string;
  year?: any;
  courseSubjects?: any[];
};

type SubjectsResponse = {
  subjects: Subject[];
  message?: string;
  status?: number;
};

export function useGetSubjects() {
  const query = useQuery<Subject[], Error>({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await client.api.admin.subject.$get();
      const data = await response.json();
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener las materias");
        (error as any).status = response.status;
        throw error;
      }
      return data.subjects;
    },
  });
  return {
    subjects: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

