import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsReadSchema } from "../schemas";
import { z } from "zod";

type RequestType = z.infer<typeof markAsReadSchema>;

const getEndpoint = () => (client.api as any).notification["mark-read"]["$post"];
type MarkReadEndpoint = ReturnType<typeof getEndpoint>;
type MarkReadResponse = Awaited<ReturnType<MarkReadEndpoint>>;
type MarkReadJson = Awaited<ReturnType<MarkReadResponse["json"]>>;

type SuccessResponse = Extract<MarkReadJson, { message: string; notification: unknown }>;
type ErrorResponse = Extract<MarkReadJson, { message: string }>;

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    mutate: markAsRead,
    mutateAsync: markAsReadAsync,
    isPending: isMarkingRead,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).notification["mark-read"].$post({ json });

      const jsonData = (await response.json()) as unknown as MarkReadJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al marcar notificación");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  return { data, error, markAsRead, markAsReadAsync, isMarkingRead };
}
