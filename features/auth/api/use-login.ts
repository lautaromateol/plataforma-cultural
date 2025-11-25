import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.auth.login)["$post"]
>["json"];

type ResponseType =
  | { message: string; status: number }
  | { dni:string; name: string; redirect: true; status: number }
  | { ok: boolean; status: number };

export function useLogin() {
  const router = useRouter()

  const {
    data,
    error,
    mutate: login,
    isPending: isLogginIn,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.login["$post"]({ json });

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json();
        const error = new Error(errorData.message || "Tus credenciales son incorrectas.");
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      const data = await response.json();
      return {
        ...data,
        status: response.status,
      };
    },
    onSuccess:(data) => {
      if(data.status === 200) {
        router.replace("/campus")
      }
    }
  });

  return { data, error, login, isLogginIn };
}
