import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetUserEndpoint = (typeof client.api.admin.users)[":id"]["$get"];
type GetUserResponse = Awaited<ReturnType<GetUserEndpoint>>;
type GetUserJson = Awaited<ReturnType<GetUserResponse["json"]>>;

type SuccessResponse = Extract<GetUserJson, { user: unknown }>;
type ErrorResponse = Extract<GetUserJson, { message: string }>;

// Tipo exportado para uso en componentes
export type UserDetails = NonNullable<SuccessResponse["user"]>;

export function useGetUser(id: string) {
  const query = useQuery<UserDetails | undefined, Error>({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await client.api.admin.users[":id"].$get({
        param: { id },
      });

      const jsonData = (await response.json()) as unknown as GetUserJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener el usuario"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.user;
    },
    enabled: !!id,
  });

  return {
    user: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

