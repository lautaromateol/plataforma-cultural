import { client } from "@/lib/client";
import { UserRole } from "@/src/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";

type UserData = {
  id: string;
  dni: string;
  email: string | null;
  name: string;
  role: UserRole;
};

export function useGetUser() {
  const query = useQuery<UserData | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await client.api.auth.$get();
      const data = await response.json();

      if (response.status !== 200) {
        const error = new Error(data.message);
        (error as any).status = response.status;
        throw error;
      }

      return (data as any).user;
    },
  });

  return { 
    user: query.data, 
    isPending: query.isPending, 
    error: query.error 
  };
}