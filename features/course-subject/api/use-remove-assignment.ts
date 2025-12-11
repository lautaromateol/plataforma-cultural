import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type RemoveAssignmentEndpoint = (typeof client.api.admin)["course-subject"][":id"]["$delete"];
type RemoveAssignmentResponse = Awaited<ReturnType<RemoveAssignmentEndpoint>>;
type RemoveAssignmentJson = Awaited<ReturnType<RemoveAssignmentResponse["json"]>>;

type SuccessResponse = Extract<RemoveAssignmentJson, { message: string }>;
type ErrorResponse = Extract<RemoveAssignmentJson, { message: string }>;

export function useRemoveAssignment(courseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (courseSubjectId) => {
      const response = await client.api.admin["course-subject"][":id"].$delete({
        param: { id: courseSubjectId },
      });

      const jsonData = (await response.json()) as unknown as RemoveAssignmentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al eliminar la asignación");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Asignación eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar la asignación");
    },
  });

  return {
    removeAssignment: mutation.mutate,
    removeAssignmentAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

