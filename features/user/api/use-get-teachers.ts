import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type Teacher = {
  id: string;
  dni: string;
  email: string | null;
  name: string;
  teacherProfile?: any;
};

type TeachersResponse = {
  teachers: Teacher[];
  message?: string;
  status?: number;
};

export function useGetTeachers() {
  const query = useQuery<Teacher[], Error>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await client.api.admin.users.teachers.$get();
      const data = (await response.json()) as any;
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener los profesores");
        (error as any).status = response.status;
        throw error;
      }
      return data.teachers as Teacher[];
    },
  });
  return {
    teachers: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

