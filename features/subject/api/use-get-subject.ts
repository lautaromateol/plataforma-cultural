import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type SubjectDetails = {
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

type SubjectResponse = {
  subject?: SubjectDetails;
  message?: string;
  status?: number;
};

export function useGetSubject(id: string) {
  const query = useQuery<SubjectDetails | undefined, Error>({
    queryKey: ["subject", id],
    queryFn: async () => {
      const response = await client.api.admin.subject[":id"].$get({ param: { id } });
      const data = await response.json();
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener la materia");
        (error as any).status = response.status;
        throw error;
      }
      return data.subject;
    },
    enabled: !!id,
  });
  return {
    subject: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

