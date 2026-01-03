import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type CreateUserEndpoint = (typeof client.api.admin.users)["$post"];
type RequestType = InferRequestType<CreateUserEndpoint>["json"];
type CreateUserResponse = Awaited<ReturnType<CreateUserEndpoint>>;
type CreateUserJson = Awaited<ReturnType<CreateUserResponse["json"]>>;

type SuccessResponse = Extract<CreateUserJson, { user: unknown }>;
type ErrorResponse = Extract<CreateUserJson, { message: string }>;

export function useCreateUser() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createUser,
    mutateAsync: createUserAsync,
    isPending: isCreatingUser,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.users.$post({ json });
      const jsonData = (await response.json()) as unknown as CreateUserJson;

      if (response.status !== 201) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al crear el usuario");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return { data, error, createUser, createUserAsync, isCreatingUser };
}

