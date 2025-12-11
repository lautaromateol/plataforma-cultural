import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type UpdateUserEndpoint = (typeof client.api.admin.users)[":id"]["$put"];
type RequestType = InferRequestType<UpdateUserEndpoint>["json"];
type UpdateUserResponse = Awaited<ReturnType<UpdateUserEndpoint>>;
type UpdateUserJson = Awaited<ReturnType<UpdateUserResponse["json"]>>;

type SuccessResponse = Extract<UpdateUserJson, { user: unknown }>;
type ErrorResponse = Extract<UpdateUserJson, { message: string }>;

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateUser,
    mutateAsync: updateUserAsync,
    isPending: isUpdatingUser,
  } = useMutation<SuccessResponse, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin.users[":id"]["$put"]({
        param: { id },
        json: data,
      });

      const jsonData = (await response.json()) as unknown as UpdateUserJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar el usuario");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
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

