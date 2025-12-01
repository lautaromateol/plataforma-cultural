import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type UserDetails = {
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
  enrollments?: Array<{
    id: string;
    course: {
      id: string;
      name: string;
      year?: any;
    };
  }>;
  courseSubjects?: Array<{
    id: string;
    course: any;
    subject: any;
  }>;
};

type UserResponse = {
  user?: UserDetails;
  message?: string;
  status?: number;
};

export function useGetUser(id: string) {
  const query = useQuery<UserDetails | undefined, Error>({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await client.api.admin.users[":id"].$get({
        param: { id },
      });
      const data = (await response.json()) as any;
      if (response.status !== 200) {
        const error = new Error(data.message || "Error al obtener el usuario");
        (error as any).status = response.status;
        throw error;
      }
      return data.user as UserDetails;
    },
    enabled: !!id,
  });
  return {
    user: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

