import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin.users[":id"])["$put"]
>["json"];

type ResponseType = {
  message: string;
  user?: any;
  status?: number;
  errors?: any;
};

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateUser,
    mutateAsync: updateUserAsync,
    isPending: isUpdatingUser,
  } = useMutation<ResponseType, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin.users[":id"]["$put"]({
        param: { id },
        json: data,
      });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al actualizar el usuario");
        (error as any).status = response.status;
        (error as any).data = json;
        throw error;
      }
      return {
        ...json,
        status: response.status,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
  return { data, error, updateUser, updateUserAsync, isUpdatingUser };
}

