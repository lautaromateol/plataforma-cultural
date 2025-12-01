import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type User = {
  id: string;
  dni: string;
  email: string | null;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  isVerified: boolean;
  firstLogin: boolean;
  createdAt: string;
  studentProfile?: any;
  teacherProfile?: any;
};

type UsersResponse = {
  users: User[];
  message?: string;
  status?: number;
};

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
      const data = (await response.json()) as any;
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener los usuarios");
        (error as any).status = response.status;
        throw error;
      }
      return data.users as User[];
    },
  });
  return {
    users: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

