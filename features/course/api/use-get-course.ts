import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetCourseEndpoint = (typeof client.api.admin.course)[":id"]["$get"];
type GetCourseResponse = Awaited<ReturnType<GetCourseEndpoint>>;
type GetCourseJson = Awaited<ReturnType<GetCourseResponse["json"]>>;

// El tipo puede ser una unión, extraer el tipo exitoso
type SuccessResponse = Extract<GetCourseJson, { course: unknown }>;
type ErrorResponse = Extract<GetCourseJson, { message: string }>;

// Extraer el tipo del curso desde la respuesta exitosa
type ServerCourse = NonNullable<SuccessResponse["course"]>;

// Tipos exportados para uso en componentes
export type SubjectWithAssignment = NonNullable<ServerCourse["subjectsWithAssignment"]>[number];

export type EnrollmentData = {
  id: string;
  status: string;
  student: {
    id: string;
    dni: string;
    name: string;
    email: string | null;
    role: string;
    studentProfile?: {
      phone?: string | null;
      address?: string | null;
      guardianName?: string | null;
      guardianPhone?: string | null;
    } | null;
  };
};

// Tipo del curso completo basado en la respuesta del servidor
// Usar el tipo del servidor directamente y solo transformar enrollments
export type CourseDetails = Omit<ServerCourse, "enrollments"> & {
  enrollments?: EnrollmentData[];
};

export function useGetCourse(id: string) {
  const query = useQuery<CourseDetails | undefined, Error>({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await client.api.admin.course[":id"].$get({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as GetCourseJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener el curso"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      if (!successData.course) {
        throw new Error("Curso no encontrado");
      }

      const serverCourse = successData.course;

      // Transformar enrollments para que coincidan con EnrollmentData
      // Filtrar enrollments con student null y mapear al formato esperado
      const enrollments: EnrollmentData[] = (
        serverCourse.enrollments || []
      )
        .filter(
          (e: { student: unknown } | null | undefined) =>
            e?.student !== null && e?.student !== undefined
        )
        .map((e: NonNullable<ServerCourse["enrollments"]>[number]) => ({
          id: e.id,
          status: e.status,
          student: {
            id: e.student!.id,
            dni: e.student!.dni,
            name: e.student!.name,
            email: e.student!.email,
            role: e.student!.role,
            studentProfile: e.student!.studentProfile || null,
          },
        }));

      // Retornar el curso con enrollments transformados
      const course: CourseDetails = {
        ...serverCourse,
        enrollments,
      };

      return course;
    },
    enabled: !!id,
  });

  return {
    course: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
