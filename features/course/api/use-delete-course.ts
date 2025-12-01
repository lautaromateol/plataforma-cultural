import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ResponseType = {
  message: string;
  status?: number;
};

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteCourse,
    isPending: isDeletingCourse,
  } = useMutation<ResponseType, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin.course[":id"]["$delete"]({
        param: { id },
      });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al eliminar el curso");
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

