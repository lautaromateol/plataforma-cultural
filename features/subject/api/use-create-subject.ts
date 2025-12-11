import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type CreateSubjectEndpoint = (typeof client.api.admin.subject)["$post"];
type RequestType = InferRequestType<CreateSubjectEndpoint>["json"];
type CreateSubjectResponse = Awaited<ReturnType<CreateSubjectEndpoint>>;
type CreateSubjectJson = Awaited<ReturnType<CreateSubjectResponse["json"]>>;

type SuccessResponse = Extract<CreateSubjectJson, { subject: unknown }>;
type ErrorResponse = Extract<CreateSubjectJson, { message: string }>;

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createSubject,
    mutateAsync: createSubjectAsync,
    isPending: isCreatingSubject,
  } = useMutation<SuccessResponse, Error, { data: RequestType; yearId: string }>({
    mutationFn: async ({ data: json, yearId }) => {
      const response = await (client.api.admin.subject.$post as any)({
        json,
        query: { yearId },
      });

      const jsonData = (await response.json()) as unknown as CreateSubjectJson;

      if (response.status !== 201) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al crear la materia");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });

  return { data, error, createSubject, createSubjectAsync, isCreatingSubject };
}

