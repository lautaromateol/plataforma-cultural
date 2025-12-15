import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";
import { toast } from "sonner";
import { createAssignmentSchema } from "../schemas";
import { z } from "zod";

type RequestType = z.infer<typeof createAssignmentSchema>;

const getEndpoint = () => (client.api as any).assignment["$post"];
type CreateAssignmentEndpoint = ReturnType<typeof getEndpoint>;
type CreateAssignmentResponse = Awaited<ReturnType<CreateAssignmentEndpoint>>;
type CreateAssignmentJson = Awaited<ReturnType<CreateAssignmentResponse["json"]>>;

type SuccessResponse = Extract<CreateAssignmentJson, { message: string; assignment: unknown }>;
type ErrorResponse = Extract<CreateAssignmentJson, { message: string }>;

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: createAssignment,
    mutateAsync: createAssignmentAsync,
    isPending: isCreatingAssignment,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).assignment.$post({ json });

      const jsonData = (await response.json()) as unknown as CreateAssignmentJson;

      if (response.status !== 201 && response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al crear la entrega");
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
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la entrega");
    },
  });

  return { data, error, createAssignment, createAssignmentAsync, isCreatingAssignment };
}
