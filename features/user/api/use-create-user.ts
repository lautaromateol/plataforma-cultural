import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin.users)["$post"]
>["json"];

type ResponseType = {
  message: string;
  user?: any;
  status?: number;
  errors?: any;
};

export function useCreateUser() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createUser,
    mutateAsync: createUserAsync,
    isPending: isCreatingUser,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.users.$post({ json });
      const data = await response.json();
      if (response.status !== 201) {
        const error = new Error(data.message || "Error al crear el usuario");
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }
      return {
        ...data,
        status: response.status,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
  return { data, error, createUser, createUserAsync, isCreatingUser };
}

