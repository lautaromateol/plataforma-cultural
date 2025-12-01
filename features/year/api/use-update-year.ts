import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin["academic-year"][":id"]) ["$put"]
>["json"];
type ResponseType = {
  message: string;
  year?: any;
  status?: number;
  errors?: any;
};
export function useUpdateYear() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateYear,
    mutateAsync: updateYearAsync,
    isPending: isUpdatingYear,
  } = useMutation<ResponseType, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin["academic-year"][":id"]["$put"]({ param: { id }, json: data });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al actualizar el año");
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
      queryClient.invalidateQueries({ queryKey: ["years"] });
      queryClient.invalidateQueries({ queryKey: ["year", variables.id] });
    },
  });
  return { data, error, updateYear, updateYearAsync, isUpdatingYear };
}
