import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono";

// Tipos inferidos automáticamente desde la ruta del servidor
type VerifyEmailEndpoint = (typeof client.api.auth)["verify-email"]["$patch"];
type RequestType = InferRequestType<VerifyEmailEndpoint>["query"];
type VerifyEmailResponse = Awaited<ReturnType<VerifyEmailEndpoint>>;
type VerifyEmailJson = Awaited<ReturnType<VerifyEmailResponse["json"]>>;

type SuccessResponse = Extract<VerifyEmailJson, { message: string }>;
type ErrorResponse = Extract<VerifyEmailJson, { message: string }>;

export function useVerifyEmail() {
  const {
    data,
    mutate: verifyEmail,
    isPending: isVerifying,
    error,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (query) => {
      const response = await client.api.auth["verify-email"]["$patch"]({ query });

      const jsonData = (await response.json()) as unknown as VerifyEmailJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message ||
            "Se ha producido un error al intentar verificar el correo electrónico."
        );
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
  });

  return { data, verifyEmail, isVerifying, error };
}
