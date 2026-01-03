import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type CreateYearEndpoint = (typeof client.api.admin)["academic-year"]["$post"];
type RequestType = InferRequestType<CreateYearEndpoint>["json"];
type CreateYearResponse = Awaited<ReturnType<CreateYearEndpoint>>;
type CreateYearJson = Awaited<ReturnType<CreateYearResponse["json"]>>;

type SuccessResponse = Extract<CreateYearJson, { year: unknown }>;
type ErrorResponse = Extract<CreateYearJson, { message: string }>;

export function useCreateYear() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createYear,
    mutateAsync: createYearAsync,
    isPending: isCreatingYear,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin["academic-year"]["$post"]({ json });
      const jsonData = (await response.json()) as unknown as CreateYearJson;

      if (response.status !== 201) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al crear el año");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["years"] });
    },
  });

  return { data, error, createYear, createYearAsync, isCreatingYear };
}
