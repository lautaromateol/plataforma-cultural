import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.admin.course)["$post"]
>["json"];

type ResponseType = {
  message: string;
  course?: any;
  status?: number;
  errors?: any;
};

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createCourse,
    mutateAsync: createCourseAsync,
    isPending: isCreatingCourse,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.course.$post({ json });
      const data = await response.json();
      if (response.status !== 201) {
        const error = new Error(data.message || "Error al crear el curso");
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
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
  return { data, error, createCourse, createCourseAsync, isCreatingCourse };
}

