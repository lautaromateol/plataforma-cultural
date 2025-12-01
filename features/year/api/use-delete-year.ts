import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ResponseType = {
  message: string;
  status?: number;
};

export function useDeleteYear() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteYear,
    isPending: isDeletingYear,
  } = useMutation<ResponseType, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin["academic-year"][":id"]["$delete"]({ param: { id } });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al eliminar el año");
        (error as any).status = response.status;
        (error as any).data = json;
        throw error;
      }
      return {
        ...json,
        status: response.status,
      };
    },
    onSuccess: (_, id) => {
      toast.success("Año escolar eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["years"] });
      queryClient.invalidateQueries({ queryKey: ["year", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el año escolar");
    },
  });
  return { data, error, deleteYear, isDeletingYear };
}
