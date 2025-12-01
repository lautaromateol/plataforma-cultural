import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type Course = {
  id: string;
  name: string;
  academicYear: string;
  capacity: number;
  classroom?: string;
  yearId: string;
  createdAt: string;
  updatedAt: string;
  year?: any;
  courseSubjects?: any[];
  enrollments?: any[];
  _count?: {
    enrollments: number;
  };
};

type CoursesResponse = {
  courses: Course[];
  message?: string;
  status?: number;
};

type UseGetCoursesParams = {
  academicYear?: string;
  yearId?: string;
};

export function useGetCourses(params?: UseGetCoursesParams) {
  const query = useQuery<Course[], Error>({
    queryKey: ["courses", params?.academicYear, params?.yearId],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.academicYear) queryParams.academicYear = params.academicYear;
      if (params?.yearId) queryParams.yearId = params.yearId;

      const response = await client.api.admin.course.$get({
        query: queryParams,
      });
      const data = (await response.json()) as any;
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener los cursos");
        (error as any).status = response.status;
        throw error;
      }
      return data.courses as Course[];
    },
  });
  return {
    courses: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

