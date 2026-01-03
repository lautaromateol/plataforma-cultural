import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { createResourceSchema } from "../schemas";

// Tipos inferidos automáticamente
type RequestType = z.infer<typeof createResourceSchema>;

// Hack para acceder a rutas con guiones: definimos una función que devuelve el endpoint
const getEndpoint = () => (client.api as any)["subject-resource"]["$post"];
type CreateResourceEndpoint = ReturnType<typeof getEndpoint>;
type CreateResourceResponse = Awaited<ReturnType<CreateResourceEndpoint>>;
type CreateResourceJson = Awaited<ReturnType<CreateResourceResponse["json"]>>;

type SuccessResponse = Extract<CreateResourceJson, { message: string; resource: unknown }>;
type ErrorResponse = Extract<CreateResourceJson, { message: string }>;

export function useCreateResource() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: createResource,
    mutateAsync: createResourceAsync,
    isPending: isCreatingResource,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any)["subject-resource"].$post({ json });

      const jsonData = (await response.json()) as unknown as CreateResourceJson;

      if (response.status !== 201 && response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al crear recurso");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.resource) {
        queryClient.invalidateQueries({
          queryKey: ["subject-resources", data.resource.subjectId],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear recurso");
    },
  });

  return { data, error, createResource, createResourceAsync, isCreatingResource };
}
