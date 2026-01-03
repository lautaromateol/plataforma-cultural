import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono";
import { toast } from "sonner";

// Tipos inferidos automáticamente desde la ruta del servidor
type ResendMailEndpoint = (typeof client.api.auth)["resend-mail"]["$patch"];
type RequestType = InferRequestType<ResendMailEndpoint>["json"];
type ResendMailResponse = Awaited<ReturnType<ResendMailEndpoint>>;
type ResendMailJson = Awaited<ReturnType<ResendMailResponse["json"]>>;

type SuccessResponse = Extract<ResendMailJson, { message: string }>;
type ErrorResponse = Extract<ResendMailJson, { message: string }>;

export function useResendMail() {
  const {
    mutate: resendMail,
    isPending: isResendingMail,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth["resend-mail"]["$patch"]({
        json,
      });

      const jsonData = (await response.json()) as unknown as ResendMailJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message);
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => toast.success(data.message),
    onError: (error) => toast.error(error.message),
  });

  return { resendMail, isResendingMail };
}
