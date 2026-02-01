import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type DeleteSubjectEndpoint = (typeof client.api.admin.subject)[":id"]["$delete"];
type DeleteSubjectResponse = Awaited<ReturnType<DeleteSubjectEndpoint>>;
type DeleteSubjectJson = Awaited<ReturnType<DeleteSubjectResponse["json"]>>;

type SuccessResponse = Extract<DeleteSubjectJson, { message: string }>;
type ErrorResponse = Extract<DeleteSubjectJson, { message: string }>;

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteSubject,
    mutateAsync: deleteSubjectAsync,
    isPending: isDeletingSubject,
  } = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin.subject[":id"]["$delete"]({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as DeleteSubjectJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al eliminar la materia");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
    },
  });

  return { data, error, deleteSubject, deleteSubjectAsync, isDeletingSubject };
}

