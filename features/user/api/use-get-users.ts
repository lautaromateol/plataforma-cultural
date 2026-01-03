import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetUsersEndpoint = (typeof client.api.admin.users)["$get"];
type GetUsersResponse = Awaited<ReturnType<GetUsersEndpoint>>;
type GetUsersJson = Awaited<ReturnType<GetUsersResponse["json"]>>;

type SuccessResponse = Extract<GetUsersJson, { users: unknown }>;
type ErrorResponse = Extract<GetUsersJson, { message: string }>;

// Tipo exportado para uso en componentes
export type User = NonNullable<SuccessResponse["users"]>[number];

type UseGetUsersParams = {
  role?: "STUDENT" | "TEACHER" | "ADMIN";
  search?: string;
};

export function useGetUsers(params?: UseGetUsersParams) {
  const query = useQuery<User[], Error>({
    queryKey: ["users", params?.role, params?.search],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.role) queryParams.role = params.role;
      if (params?.search) queryParams.search = params.search;

      const response = await client.api.admin.users.$get({
        query: queryParams,
      });

      const jsonData = (await response.json()) as unknown as GetUsersJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los usuarios"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.users;
    },
  });

  return {
    users: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

