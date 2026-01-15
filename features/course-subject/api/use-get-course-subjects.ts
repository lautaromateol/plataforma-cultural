import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetCourseSubjectsEndpoint =
  (typeof client.api.admin)["course-subject"]["$get"];
type GetCourseSubjectsResponse = Awaited<ReturnType<GetCourseSubjectsEndpoint>>;
type GetCourseSubjectsJson = Awaited<
  ReturnType<GetCourseSubjectsResponse["json"]>
>;

type SuccessResponse = Extract<
  GetCourseSubjectsJson,
  { courseSubjects: unknown }
>;
type ErrorResponse = Extract<GetCourseSubjectsJson, { message: string }>;

export type CourseSubject = NonNullable<
  SuccessResponse["courseSubjects"]
>[number];

type UseGetCourseSubjectsParams = {
  courseId?: string;
};

export function useGetCourseSubjects(params?: UseGetCourseSubjectsParams) {
  const {
    data: courseSubjects,
    isPending,
    error,
  } = useQuery<CourseSubject[], Error>({
    queryKey: ["course-subjects", params?.courseId],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.courseId) queryParams.courseId = params.courseId;

      const response = await client.api.admin["course-subject"].$get({
        query: queryParams,
      });

      const jsonData =
        (await response.json()) as unknown as GetCourseSubjectsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener las materias del curso"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.courseSubjects;
    },
  });

  return {
    courseSubjects,
    isPending,
    error,
  };
}
