import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type CourseDetails = {
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
};

type CourseResponse = {
  course?: CourseDetails;
  message?: string;
  status?: number;
};

export function useGetCourse(id: string) {
  const query = useQuery<CourseDetails | undefined, Error>({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await client.api.admin.course[":id"].$get({
        param: { id },
      });
      const data = await response.json();
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener el curso");
        (error as any).status = response.status;
        throw error;
      }
      return data.course;
    },
    enabled: !!id,
  });
  return {
    course: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

