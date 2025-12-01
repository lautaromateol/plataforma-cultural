import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type Student = {
  id: string;
  dni: string;
  email: string | null;
  name: string;
  studentProfile?: any;
  enrollments?: Array<{
    id: string;
    course: {
      id: string;
      name: string;
      year?: any;
    };
  }>;
};

type StudentsResponse = {
  students: Student[];
  message?: string;
  status?: number;
};

export function useGetStudents() {
  const query = useQuery<Student[], Error>({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await client.api.admin.users.students.$get();
      const data = (await response.json()) as any;
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener los estudiantes");
        (error as any).status = response.status;
        throw error;
      }
      return data.students as Student[];
    },
  });
  return {
    students: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

