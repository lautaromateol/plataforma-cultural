import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteLevel() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await client.api.admin.level[":id"].$delete({
        param: { id },
      });

      const jsonData = await response.json();

      if (response.status !== 200) {
        throw new Error(
          (jsonData as { message?: string }).message ||
            "Error al eliminar el nivel"
        );
      }

      return jsonData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      toast.success("Nivel eliminado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el nivel");
    },
  });

  return mutation;
}
