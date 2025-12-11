import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Tipos inferidos automáticamente desde la ruta del servidor
type LogoutEndpoint = (typeof client.api.auth.logout)["$post"];
type LogoutResponse = Awaited<ReturnType<LogoutEndpoint>>;
type LogoutJson = Awaited<ReturnType<LogoutResponse["json"]>>;

type SuccessResponse = Extract<LogoutJson, { message: string }>;
type ErrorResponse = Extract<LogoutJson, { message: string }>;

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient()

  const {
    mutate: logout,
    isPending: isLoggingOut,
  } = useMutation<SuccessResponse, Error, void>({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
      const jsonData = (await response.json()) as unknown as LogoutJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al cerrar sesión");
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["campus"] })
      queryClient.removeQueries({ queryKey: ["currentUser"] })
      router.replace("/login");
    },
    onError: () => {
      // Incluso si hay un error, redirigir al login
      router.replace("/login");
    },
  });

  return { logout, isLoggingOut };
}

