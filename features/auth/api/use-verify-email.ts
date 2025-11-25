import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.auth)["verify-email"]["$patch"]
>["query"];
type ResponseType = {
  message: string;
  status: number;
};

export function useVerifyEmail() {
  const {
    data,
    mutate: verifyEmail,
    isPending: isVerifying,
    error,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (query) => {
      const response = await client.api.auth["verify-email"]["$patch"]({ query });

      const data = await response.json();

      if (response.status !== 200) {
        const error = new Error(
          data.message ||
            "Se ha producido un error al intentar verificar el correo electrónico."
        );
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }

      return {
        ...data,
        status: response.status,
      };
    },
  });

  return { data, verifyEmail, isVerifying, error };
}
