import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type DeleteCourseEndpoint = (typeof client.api.admin.course)[":id"]["$delete"];
type DeleteCourseResponse = Awaited<ReturnType<DeleteCourseEndpoint>>;
type DeleteCourseJson = Awaited<ReturnType<DeleteCourseResponse["json"]>>;

type SuccessResponse = Extract<DeleteCourseJson, { message: string }>;
type ErrorResponse = Extract<DeleteCourseJson, { message: string }>;

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteCourse,
    isPending: isDeletingCourse,
  } = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin.course[":id"]["$delete"]({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as DeleteCourseJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al eliminar el curso");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, id) => {
      toast.success("Curso eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el curso");
    },
  });

  return { data, error, deleteCourse, isDeletingCourse };
}

