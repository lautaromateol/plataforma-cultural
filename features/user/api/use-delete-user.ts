import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ResponseType = {
  message: string;
  status?: number;
};

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: deleteUser,
    isPending: isDeletingUser,
  } = useMutation<ResponseType, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.admin.users[":id"]["$delete"]({
        param: { id },
      });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al eliminar el usuario");
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

