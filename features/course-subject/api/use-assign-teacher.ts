import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type AssignTeacherEndpoint = (typeof client.api.admin)["course-subject"]["$post"];
type RequestType = InferRequestType<AssignTeacherEndpoint>["json"];
type AssignTeacherResponse = Awaited<ReturnType<AssignTeacherEndpoint>>;
type AssignTeacherJson = Awaited<ReturnType<AssignTeacherResponse["json"]>>;

type SuccessResponse = Extract<AssignTeacherJson, { courseSubject?: unknown }>;
type ErrorResponse = Extract<AssignTeacherJson, { message: string }>;

export function useAssignTeacher(courseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin["course-subject"].$post({ json });

      const jsonData = (await response.json()) as unknown as AssignTeacherJson;

      if (response.status !== 201) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al asignar el profesor");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profesor asignado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error al asignar el profesor");
    },
  });

  return {
    assignTeacher: mutation.mutate,
    assignTeacherAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

