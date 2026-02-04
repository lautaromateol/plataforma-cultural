import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateLevelSchema } from "../schemas";
import { toast } from "sonner";

type RequestType = z.infer<typeof updateLevelSchema>;

export function useUpdateLevel(id: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RequestType) => {
      const response = await client.api.admin.level[":id"].$put({
        param: { id },
        json: data,
      });

      const jsonData = await response.json();

      if (response.status !== 200) {
        throw new Error(
          (jsonData as { message?: string }).message ||
            "Error al actualizar el nivel"
        );
      }

      return jsonData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      queryClient.invalidateQueries({ queryKey: ["level", id] });
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      toast.success("Nivel actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el nivel");
    },
  });

  return mutation;
}
