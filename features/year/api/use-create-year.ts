import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin["academic-year"]) ["$post"]
>["json"];
type ResponseType = {
  message: string;
  year?: any;
  status?: number;
  errors?: any;
};
export function useCreateYear() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createYear,
    mutateAsync: createYearAsync,
    isPending: isCreatingYear,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin["academic-year"]["$post"]({ json });
      const data = await response.json();
      if (response.status !== 201) {
        const error = new Error(data.message || "Error al crear el año");
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
      queryClient.invalidateQueries({ queryKey: ["years"] });
    },
  });
  return { data, error, createYear, createYearAsync, isCreatingYear };
}
