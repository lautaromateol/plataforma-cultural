import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type UpdateAssignmentEndpoint = (typeof client.api.admin)["course-subject"][":id"]["$put"];
type RequestType = InferRequestType<UpdateAssignmentEndpoint>["json"];
type UpdateAssignmentResponse = Awaited<ReturnType<UpdateAssignmentEndpoint>>;
type UpdateAssignmentJson = Awaited<ReturnType<UpdateAssignmentResponse["json"]>>;

type SuccessResponse = Extract<UpdateAssignmentJson, { courseSubject?: unknown }>;
type ErrorResponse = Extract<UpdateAssignmentJson, { message: string }>;

type UpdateAssignmentData = {
  id: string;
  data: RequestType;
};

export function useUpdateAssignment(courseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<SuccessResponse, Error, UpdateAssignmentData>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin["course-subject"][":id"].$put({
        param: { id },
        json: data,
      });

      const jsonData = (await response.json()) as unknown as UpdateAssignmentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar la asignación");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Asignación actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar la asignación");
    },
  });

  return {
    updateAssignment: mutation.mutate,
    updateAssignmentAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

