import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateStudyPlanSchema } from "../schemas";
import { toast } from "sonner";

type RequestType = z.infer<typeof updateStudyPlanSchema>;

export function useUpdateStudyPlan(id: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RequestType) => {
      const response = await client.api.admin["study-plan"][":id"].$put({
        param: { id },
        json: data,
      });

      const jsonData = await response.json();

      if (response.status !== 200) {
        throw new Error(
          (jsonData as { message?: string }).message ||
            "Error al actualizar el plan de estudio"
        );
      }

      return jsonData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      queryClient.invalidateQueries({ queryKey: ["study-plan", id] });
      toast.success("Plan de estudio actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el plan de estudio");
    },
  });

  return mutation;
}
