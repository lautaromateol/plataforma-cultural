import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetAuthUserEndpoint = (typeof client.api.auth)["$get"];
type GetAuthUserResponse = Awaited<ReturnType<GetAuthUserEndpoint>>;
type GetAuthUserJson = Awaited<ReturnType<GetAuthUserResponse["json"]>>;

type SuccessResponse = Extract<GetAuthUserJson, { user: unknown }>;
type ErrorResponse = Extract<GetAuthUserJson, { message: string }>;

// Tipo exportado para uso en componentes
export type UserData = NonNullable<SuccessResponse["user"]>;

export function useGetUser() {
  const query = useQuery<UserData | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await client.api.auth.$get();
      const jsonData = (await response.json()) as unknown as GetAuthUserJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message);
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.user;
    },
  });

  return {
    user: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}