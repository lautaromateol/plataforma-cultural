import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { gradeAssignmentSchema } from "../schemas";
import { z } from "zod";

type RequestType = z.infer<typeof gradeAssignmentSchema>;

const getEndpoint = () => (client.api as any).assignment["grade"]["$post"];
type GradeAssignmentEndpoint = ReturnType<typeof getEndpoint>;
type GradeAssignmentResponse = Awaited<ReturnType<GradeAssignmentEndpoint>>;
type GradeAssignmentJson = Awaited<ReturnType<GradeAssignmentResponse["json"]>>;

type SuccessResponse = Extract<GradeAssignmentJson, { message: string; submission: unknown }>;
type ErrorResponse = Extract<GradeAssignmentJson, { message: string }>;

export function useGradeAssignment() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: gradeAssignment,
    mutateAsync: gradeAssignmentAsync,
    isPending: isGradingAssignment,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).assignment["grade"].$post({ json });

      const jsonData = (await response.json()) as unknown as GradeAssignmentJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al calificar la entrega");
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
        queryKey: ["assignment"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al calificar la entrega");
    },
  });

  return { data, error, gradeAssignment, gradeAssignmentAsync, isGradingAssignment };
}
