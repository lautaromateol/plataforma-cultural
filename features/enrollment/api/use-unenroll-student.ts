import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type UnenrollStudentEndpoint = (typeof client.api.admin.enrollment)[":studentId"][":courseId"]["$delete"];
type UnenrollStudentResponse = Awaited<ReturnType<UnenrollStudentEndpoint>>;
type UnenrollStudentJson = Awaited<ReturnType<UnenrollStudentResponse["json"]>>;

type SuccessResponse = Extract<UnenrollStudentJson, { message: string }>;
type ErrorResponse = Extract<UnenrollStudentJson, { message: string }>;

type RequestType = {
  studentId: string;
  courseId: string;
};
type UseUnenrollStudentParams = {
  yearId: string;
}

export function useUnenrollStudent(params: UseUnenrollStudentParams) {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: unenrollStudent,
    mutateAsync: unenrollStudentAsync,
    isPending: isUnenrolling,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async ({ studentId, courseId }) => {
      const response = await client.api.admin.enrollment[":studentId"][":courseId"].$delete({
        param: { studentId, courseId },
      });

      const jsonData = (await response.json()) as unknown as UnenrollStudentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al desmatricular estudiante");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["students", params.yearId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
    },
  });

  return { data, error, unenrollStudent, unenrollStudentAsync, isUnenrolling };
}

