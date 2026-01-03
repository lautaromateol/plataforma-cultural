import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type CreateMailEndpoint = (typeof client.api.auth)["create-mail"]["$patch"];
type RequestType = InferRequestType<CreateMailEndpoint>["json"];
type CreateMailResponse = Awaited<ReturnType<CreateMailEndpoint>>;
type CreateMailJson = Awaited<ReturnType<CreateMailResponse["json"]>>;

type SuccessResponse = Extract<CreateMailJson, { message: string }>;
type ErrorResponse = Extract<CreateMailJson, { message: string }>;

export function useCreateMail() {
  const {
    data,
    error,
    mutate: createMail,
    isPending: isCreatingMail,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth["create-mail"]["$patch"]({
        json,
      });

      const jsonData = (await response.json()) as unknown as CreateMailJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
  });

  return { data, error, createMail, isCreatingMail };
}
