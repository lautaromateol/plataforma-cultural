import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type StudentData = {
  id: string;
  dni: string;
  name: string;
  email: string | null;
  courseId: string;
  courseName: string;
  enrollmentStatus: string;
  studentProfile?: {
    phone?: string | null;
    address?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
  } | null;
};

type TeacherData = {
  id: string;
  dni: string;
  name: string;
  email: string | null;
  teacherProfile?: {
    specialization?: string | null;
    hireDate?: string | null;
  } | null;
  subjects: Array<{
    id: string;
    name: string;
    code: string | null;
    courseId: string;
    courseName: string;
  }>;
};

type CourseData = {
  id: string;
  name: string;
  academicYear: string;
  capacity: number;
  classroom: string | null;
  enrollmentCount: number;
  subjects: Array<{
    id: string;
    name: string;
    code: string | null;
    teacher: {
      id: string;
      name: string;
    } | null;
  }>;
};

type SubjectData = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  courses: Array<{
    id: string;
    name: string;
    academicYear: string;
  }>;
};

type YearDetailsResponse = {
  year: {
    id: string;
    level: number;
    name: string;
    description: string | null;
  };
  students: StudentData[];
  teachers: TeacherData[];
  courses: CourseData[];
  subjects: SubjectData[];
};

export function useGetYearDetails(level: number) {
  const query = useQuery<YearDetailsResponse, Error>({
    queryKey: ["year-details", level],
    queryFn: async () => {
      const response = await client.api.admin["academic-year"].level[
        ":level"
      ].$get({
        param: { level: level.toString() },
      });
      const data = (await response.json()) as any;
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener los detalles del año");
        (error as any).status = response.status;
        throw error;
      }
      return data as YearDetailsResponse;
    },
    enabled: level >= 1 && level <= 6,
  });

  return {
    yearDetails: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

