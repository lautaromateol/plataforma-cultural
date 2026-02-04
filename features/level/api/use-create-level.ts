import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createLevelSchema } from "../schemas";
import { toast } from "sonner";

type RequestType = z.infer<typeof createLevelSchema>;

export function useCreateLevel() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RequestType) => {
      const response = await client.api.admin.level.$post({
        json: data,
      });

      const jsonData = await response.json();

      if (response.status !== 201) {
        throw new Error(
          (jsonData as { message?: string }).message ||
            "Error al crear el nivel"
        );
      }

      return jsonData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      toast.success("Nivel creado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el nivel");
    },
  });

  return mutation;
}
