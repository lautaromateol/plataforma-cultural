import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getEndpoint = () => (client.api as any).assignment[":id"]["$delete"];
type DeleteAssignmentEndpoint = ReturnType<typeof getEndpoint>;
type DeleteAssignmentResponse = Awaited<ReturnType<DeleteAssignmentEndpoint>>;
type DeleteAssignmentJson = Awaited<ReturnType<DeleteAssignmentResponse["json"]>>;

type SuccessResponse = Extract<DeleteAssignmentJson, { message: string; subjectId?: string }>;
type ErrorResponse = Extract<DeleteAssignmentJson, { message: string }>;

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: deleteAssignment,
    mutateAsync: deleteAssignmentAsync,
    isPending: isDeletingAssignment,
  } = useMutation<SuccessResponse, Error, { id: string; subjectId: string }>({
    mutationFn: async ({ id }) => {
      const response = await (client.api as any).assignment[":id"].$delete({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as DeleteAssignmentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al eliminar la entrega");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      const subjectId = data.subjectId || variables.subjectId;
      if (subjectId) {
        queryClient.invalidateQueries({
          queryKey: ["assignments", subjectId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la entrega");
    },
  });

  return { data, error, deleteAssignment, deleteAssignmentAsync, isDeletingAssignment };
}
