import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type UpdateYearEndpoint = (typeof client.api.admin)["academic-year"][":id"]["$put"];
type RequestType = InferRequestType<UpdateYearEndpoint>["json"];
type UpdateYearResponse = Awaited<ReturnType<UpdateYearEndpoint>>;
type UpdateYearJson = Awaited<ReturnType<UpdateYearResponse["json"]>>;

type SuccessResponse = Extract<UpdateYearJson, { year: unknown }>;
type ErrorResponse = Extract<UpdateYearJson, { message: string }>;

export function useUpdateYear() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateYear,
    mutateAsync: updateYearAsync,
    isPending: isUpdatingYear,
  } = useMutation<SuccessResponse, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin["academic-year"][":id"]["$put"]({
        param: { id },
        json: data,
      });

      const jsonData = (await response.json()) as unknown as UpdateYearJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar el año");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["years"] });
      queryClient.invalidateQueries({ queryKey: ["year", variables.id] });
    },
  });

  return { data, error, updateYear, updateYearAsync, isUpdatingYear };
}
