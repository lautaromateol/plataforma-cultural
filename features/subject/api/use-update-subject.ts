import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin.subject[":id"])["$put"]
>["json"];

type ResponseType = {
  message: string;
  subject?: any;
  status?: number;
  errors?: any;
};

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateSubject,
    mutateAsync: updateSubjectAsync,
    isPending: isUpdatingSubject,
  } = useMutation<ResponseType, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin.subject[":id"]["$put"]({
        param: { id },
        json: data,
      });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al actualizar la materia");
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
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", variables.id] });
    },
  });
  return { data, error, updateSubject, updateSubjectAsync, isUpdatingSubject };
}

