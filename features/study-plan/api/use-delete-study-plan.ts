import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteStudyPlan() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await client.api.admin["study-plan"][":id"].$delete({
        param: { id },
      });

      const jsonData = await response.json();

      if (response.status !== 200) {
        throw new Error(
          (jsonData as { message?: string }).message ||
            "Error al eliminar el plan de estudio"
        );
      }

      return jsonData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      toast.success("Plan de estudio eliminado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el plan de estudio");
    },
  });

  return mutation;
}
