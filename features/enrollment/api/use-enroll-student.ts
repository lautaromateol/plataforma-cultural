import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type EnrollStudentEndpoint = (typeof client.api.admin.enrollment)["$post"];
type RequestType = InferRequestType<EnrollStudentEndpoint>["json"];
type EnrollStudentResponse = Awaited<ReturnType<EnrollStudentEndpoint>>;
type EnrollStudentJson = Awaited<ReturnType<EnrollStudentResponse["json"]>>;

type SuccessResponse = Extract<EnrollStudentJson, { enrollment?: unknown }>;
type ErrorResponse = Extract<EnrollStudentJson, { message: string }>;
type UseEnrollStudentParams = {
  levelId?: string;
  studyPlanId?: string;
}

export function useEnrollStudent(params: UseEnrollStudentParams = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: enrollStudent,
    mutateAsync: enrollStudentAsync,
    isPending: isEnrolling,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.enrollment.$post({ json });
      const jsonData = (await response.json()) as unknown as EnrollStudentJson;

      if (response.status !== 201) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al matricular estudiante");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      if (params.levelId) {
        queryClient.invalidateQueries({ queryKey: ["students", params.levelId] });
      }
      if (params.studyPlanId) {
        queryClient.invalidateQueries({ queryKey: ["study-plan-details", params.studyPlanId] });
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
    },
  });

  return { data, error, enrollStudent, enrollStudentAsync, isEnrolling };
}

