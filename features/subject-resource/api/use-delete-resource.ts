import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Hack para acceder a rutas con guiones: definimos una función que devuelve el endpoint
const getEndpoint = () => (client.api as any)["subject-resource"][":id"]["$delete"];
type DeleteResourceEndpoint = ReturnType<typeof getEndpoint>;
type DeleteResourceResponse = Awaited<ReturnType<DeleteResourceEndpoint>>;
type DeleteResourceJson = Awaited<ReturnType<DeleteResourceResponse["json"]>>;

type SuccessResponse = Extract<DeleteResourceJson, { message: string }>;
type ErrorResponse = Extract<DeleteResourceJson, { message: string }>;

export function useDeleteResource(subjectId: string) {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: deleteResource,
    mutateAsync: deleteResourceAsync,
    isPending: isDeletingResource,
  } = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await (client.api as any)["subject-resource"][":id"].$delete({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as DeleteResourceJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al eliminar recurso");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, id) => {
      toast.success("Recurso eliminado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["subject-resources", subjectId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar recurso");
    },
  });

  return { data, error, deleteResource, deleteResourceAsync, isDeletingResource };
}
