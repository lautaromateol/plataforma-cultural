import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type DeleteUserEndpoint = (typeof client.api.admin.users)[":id"]["$delete"];
type DeleteUserResponse = Awaited<ReturnType<DeleteUserEndpoint>>;
type DeleteUserJson = Awaited<ReturnType<DeleteUserResponse["json"]>>;

type SuccessResponse = Extract<DeleteUserJson, { message: string }>;
type ErrorResponse = Extract<DeleteUserJson, { message: string }>;

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteUser,
    isPending: isDeletingUser,
  } = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin.users[":id"]["$delete"]({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as DeleteUserJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al eliminar el usuario");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, id) => {
      toast.success("Usuario eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el usuario");
    },
  });

  return { data, error, deleteUser, isDeletingUser };
}

