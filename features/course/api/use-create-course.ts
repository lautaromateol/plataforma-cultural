import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type CreateCourseEndpoint = (typeof client.api.admin.course)["$post"];
type RequestType = InferRequestType<CreateCourseEndpoint>["json"];
type CreateCourseResponse = Awaited<ReturnType<CreateCourseEndpoint>>;
type CreateCourseJson = Awaited<ReturnType<CreateCourseResponse["json"]>>;

type SuccessResponse = Extract<CreateCourseJson, { course: unknown }>;
type ErrorResponse = Extract<CreateCourseJson, { message: string }>;

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    mutate: createCourse,
    mutateAsync: createCourseAsync,
    isPending: isCreatingCourse,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.course.$post({ json });
      const jsonData = (await response.json()) as unknown as CreateCourseJson;

      if (response.status !== 201) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al crear el curso");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return { data, error, createCourse, createCourseAsync, isCreatingCourse };
}

