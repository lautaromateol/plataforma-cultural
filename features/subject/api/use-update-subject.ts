import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type UpdateSubjectEndpoint = (typeof client.api.admin.subject)[":id"]["$put"];
type RequestType = InferRequestType<UpdateSubjectEndpoint>["json"];
type UpdateSubjectResponse = Awaited<ReturnType<UpdateSubjectEndpoint>>;
type UpdateSubjectJson = Awaited<ReturnType<UpdateSubjectResponse["json"]>>;

type SuccessResponse = Extract<UpdateSubjectJson, { subject: unknown }>;
type ErrorResponse = Extract<UpdateSubjectJson, { message: string }>;

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateSubject,
    mutateAsync: updateSubjectAsync,
    isPending: isUpdatingSubject,
  } = useMutation<SuccessResponse, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin.subject[":id"]["$put"]({
        param: { id },
        json: data,
      });

      const jsonData = (await response.json()) as unknown as UpdateSubjectJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar la materia");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", variables.id] });
    },
  });

  return { data, error, updateSubject, updateSubjectAsync, isUpdatingSubject };
}

