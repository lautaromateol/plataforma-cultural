import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type ResponseType = {
  message: string;
  status?: number;
};

export function useLogout() {
  const router = useRouter();

  const {
    mutate: logout,
    isPending: isLoggingOut,
  } = useMutation<ResponseType, Error, void>({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
      const data = await response.json();

      if (response.status !== 200) {
        const error = new Error(data.message || "Error al cerrar sesión");
        (error as any).status = response.status;
        throw error;
      }

      return {
        ...data,
        status: response.status,
      };
    },
    onSuccess: () => {
      router.replace("/login");
    },
    onError: () => {
      // Incluso si hay un error, redirigir al login
      router.replace("/login");
    },
  });

  return { logout, isLoggingOut };
}

