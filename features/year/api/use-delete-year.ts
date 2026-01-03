import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type DeleteYearEndpoint =
  (typeof client.api.admin)["academic-year"][":id"]["$delete"];
type DeleteYearResponse = Awaited<ReturnType<DeleteYearEndpoint>>;
type DeleteYearJson = Awaited<ReturnType<DeleteYearResponse["json"]>>;

type SuccessResponse = Extract<DeleteYearJson, { message: string }>;
type ErrorResponse = Extract<DeleteYearJson, { message: string }>;

export function useDeleteYear() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteYear,
    isPending: isDeletingYear,
  } = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin["academic-year"][":id"][
        "$delete"
      ]({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as DeleteYearJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al eliminar el año"
        );
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, id) => {
      toast.success("Año escolar eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["years"] });
      queryClient.invalidateQueries({ queryKey: ["year", id] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el año escolar");
    },
  });

  return { data, error, deleteYear, isDeletingYear };
}
