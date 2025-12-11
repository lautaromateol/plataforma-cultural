import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type UpdateCourseEndpoint = (typeof client.api.admin.course)[":id"]["$put"];
type RequestType = InferRequestType<UpdateCourseEndpoint>["json"];
type UpdateCourseResponse = Awaited<ReturnType<UpdateCourseEndpoint>>;
type UpdateCourseJson = Awaited<ReturnType<UpdateCourseResponse["json"]>>;

type SuccessResponse = Extract<UpdateCourseJson, { course: unknown }>;
type ErrorResponse = Extract<UpdateCourseJson, { message: string }>;

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: updateCourse,
    mutateAsync: updateCourseAsync,
    isPending: isUpdatingCourse,
  } = useMutation<SuccessResponse, Error, { id: string; data: RequestType }>({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.admin.course[":id"]["$put"]({
        param: { id },
        json: data,
      });

      const jsonData = (await response.json()) as unknown as UpdateCourseJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al actualizar el curso");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
  });

  return { data, error, updateCourse, updateCourseAsync, isUpdatingCourse };
}

