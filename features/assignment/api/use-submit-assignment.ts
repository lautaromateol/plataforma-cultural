import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitAssignmentSchema } from "../schemas";
import { z } from "zod";

type RequestType = z.infer<typeof submitAssignmentSchema>;

const getEndpoint = () => (client.api as any).assignment["submit"]["$post"];
type SubmitAssignmentEndpoint = ReturnType<typeof getEndpoint>;
type SubmitAssignmentResponse = Awaited<ReturnType<SubmitAssignmentEndpoint>>;
type SubmitAssignmentJson = Awaited<ReturnType<SubmitAssignmentResponse["json"]>>;

type SuccessResponse = Extract<SubmitAssignmentJson, { message: string; submission: unknown }>;
type ErrorResponse = Extract<SubmitAssignmentJson, { message: string }>;

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: submitAssignment,
    mutateAsync: submitAssignmentAsync,
    isPending: isSubmittingAssignment,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).assignment["submit"].$post({ json });

      const jsonData = (await response.json()) as unknown as SubmitAssignmentJson;

      if (response.status !== 201 && response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al subir la entrega");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["assignment", variables.assignmentId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al subir la entrega");
    },
  });

  return { data, error, submitAssignment, submitAssignmentAsync, isSubmittingAssignment };
}
