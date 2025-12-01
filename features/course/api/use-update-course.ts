import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin.course[":id"])["$put"]
>["json"];

type ResponseType = {
  message: string;
  course?: any;
  status?: number;
  errors?: any;
};

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateCourse,
    mutateAsync: updateCourseAsync,
    isPending: isUpdatingCourse,
  } = useMutation<ResponseType, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin.course[":id"]["$put"]({
        param: { id },
        json: data,
      });
      const json = await response.json();
      if (response.status !== 200) {
        const error = new Error(json.message || "Error al actualizar el curso");
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
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
  });
  return { data, error, updateCourse, updateCourseAsync, isUpdatingCourse };
}

