import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { updateResourceSchema } from "../schemas";

// Tipos inferidos automáticamente
type RequestType = z.infer<typeof updateResourceSchema>;

// Hack para acceder a rutas con guiones: definimos una función que devuelve el endpoint
const getEndpoint = () => (client.api as any)["subject-resource"][":id"]["$patch"];
type UpdateResourceEndpoint = ReturnType<typeof getEndpoint>;
type UpdateResourceResponse = Awaited<ReturnType<UpdateResourceEndpoint>>;
type UpdateResourceJson = Awaited<ReturnType<UpdateResourceResponse["json"]>>;

type SuccessResponse = Extract<UpdateResourceJson, { message: string; resource: unknown }>;
type ErrorResponse = Extract<UpdateResourceJson, { message: string }>;

export function useUpdateResource(id: string, subjectId: string) {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: updateResource,
    mutateAsync: updateResourceAsync,
    isPending: isUpdatingResource,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any)["subject-resource"][":id"].$patch({
        param: { id },
        json,
      });

      const jsonData = (await response.json()) as unknown as UpdateResourceJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar recurso");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["subject-resources", subjectId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar recurso");
    },
  });

  return { data, error, updateResource, updateResourceAsync, isUpdatingResource };
}
