import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAssignmentSchema } from "../schemas";
import { z } from "zod";

type RequestType = z.infer<typeof updateAssignmentSchema> & { id: string };

const getEndpoint = () => (client.api as any).assignment[":id"]["$put"];
type UpdateAssignmentEndpoint = ReturnType<typeof getEndpoint>;
type UpdateAssignmentResponse = Awaited<ReturnType<UpdateAssignmentEndpoint>>;
type UpdateAssignmentJson = Awaited<ReturnType<UpdateAssignmentResponse["json"]>>;

type SuccessResponse = Extract<UpdateAssignmentJson, { message: string; assignment: unknown }>;
type ErrorResponse = Extract<UpdateAssignmentJson, { message: string }>;

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: updateAssignment,
    mutateAsync: updateAssignmentAsync,
    isPending: isUpdatingAssignment,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async ({ id, ...json }) => {
      const response = await (client.api as any).assignment[":id"].$put({
        param: { id },
        json,
      });

      const jsonData = (await response.json()) as unknown as UpdateAssignmentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar la entrega");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.assignment) {
        const assignment = data.assignment as any;
        if (assignment.subjectId) {
          queryClient.invalidateQueries({
            queryKey: ["assignments", assignment.subjectId],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["assignments"],
        });
        queryClient.invalidateQueries({
          queryKey: ["assignment", assignment.id],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la entrega");
    },
  });

  return { data, error, updateAssignment, updateAssignmentAsync, isUpdatingAssignment };
}
