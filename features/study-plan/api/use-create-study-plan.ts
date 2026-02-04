import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createStudyPlanSchema } from "../schemas";
import { toast } from "sonner";

type RequestType = z.infer<typeof createStudyPlanSchema>;

export function useCreateStudyPlan() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RequestType) => {
      const response = await client.api.admin["study-plan"].$post({
        json: data,
      });

      const jsonData = await response.json();

      if (response.status !== 201) {
        throw new Error(
          (jsonData as { message?: string }).message ||
            "Error al crear el plan de estudio"
        );
      }

      return jsonData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      toast.success("Plan de estudio creado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el plan de estudio");
    },
  });

  return mutation;
}
