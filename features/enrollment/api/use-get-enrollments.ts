import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetEnrollmentsEndpoint = (typeof client.api.admin.enrollment)["$get"];
type GetEnrollmentsResponse = Awaited<ReturnType<GetEnrollmentsEndpoint>>;
type GetEnrollmentsJson = Awaited<ReturnType<GetEnrollmentsResponse["json"]>>;

type SuccessResponse = Extract<GetEnrollmentsJson, { enrollments: unknown }>;
type ErrorResponse = Extract<GetEnrollmentsJson, { message: string }>;

export type Enrollment = NonNullable<SuccessResponse["enrollments"]>[number];

type UseGetEnrollmentsParams = {
  courseId?: string;
};

export function useGetEnrollments(params?: UseGetEnrollmentsParams) {
  const {
    data: enrollments,
    isPending,
    error,
  } = useQuery<Enrollment[], Error>({
    queryKey: ["enrollments", params?.courseId],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.courseId) queryParams.courseId = params.courseId;

      const response = await client.api.admin.enrollment.$get({
        query: queryParams,
      });

      const jsonData = (await response.json()) as unknown as GetEnrollmentsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los alumnos matriculados"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.enrollments;
    },
  });

  return {
    enrollments,
    isPending,
    error,
  };
}
