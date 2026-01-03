import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono";
import { useRouter } from "next/navigation";

// Tipos inferidos automáticamente desde la ruta del servidor
type LoginEndpoint = (typeof client.api.auth.login)["$post"];
type RequestType = InferRequestType<LoginEndpoint>["json"];
type LoginResponse = Awaited<ReturnType<LoginEndpoint>>;
type LoginJson = Awaited<ReturnType<LoginResponse["json"]>>;

type SuccessResponse = Extract<
  LoginJson,
  { ok?: boolean } | { redirect?: boolean }
>;
type ErrorResponse = Extract<LoginJson, { message: string }>;

export function useLogin() {
  const router = useRouter();

  const {
    data,
    error,
    mutate: login,
    isPending: isLogginIn,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.login["$post"]({ json });

      if (response.status === 401 || response.status === 403) {
        const errorData = (await response.json()) as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Tus credenciales son incorrectas."
        );
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const jsonData = (await response.json()) as unknown as LoginJson;
      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: (data) => {
      if ("ok" in data && data.ok) {
        router.replace(data.role === "ADMIN" ? "/admin" : "/campus");
      }
    },
  });

  return { data, error, login, isLogginIn };
}
