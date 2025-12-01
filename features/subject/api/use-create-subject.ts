import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin.subject)["$post"]
>["json"];

type ResponseType = {
  message: string;
  subject?: any;
  status?: number;
  errors?: any;
};

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createSubject,
    mutateAsync: createSubjectAsync,
    isPending: isCreatingSubject,
  } = useMutation<ResponseType, Error, { data: RequestType; yearId: string }>({
    mutationFn: async ({ data: json, yearId }) => {
      const response = await client.api.admin.subject.$post({
        json,
        query: { yearId },
      });
      const data = await response.json();
      if (response.status !== 201) {
        const error = new Error(data.message || "Error al crear la materia");
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
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
  return { data, error, createSubject, createSubjectAsync, isCreatingSubject };
}

