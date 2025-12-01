import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ResponseType = {
  message: string;
  status?: number;
};

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteSubject,
    isPending: isDeletingSubject,
  } = useMutation<ResponseType, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin.subject[":id"]["$delete"]({
        param: { id },
      });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al eliminar la materia");
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
      toast.success("Materia eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la materia");
    },
  });
  return { data, error, deleteSubject, isDeletingSubject };
}

