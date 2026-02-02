import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetStudentProfileEndpoint = (typeof client.api.profile)[":id"]["$get"];
type GetStudentProfileResponse = Awaited<ReturnType<GetStudentProfileEndpoint>>;
type GetStudentProfileJson = Awaited<ReturnType<GetStudentProfileResponse["json"]>>;

type SuccessResponse = Extract<GetStudentProfileJson, { profile: unknown }>;
type ErrorResponse = Extract<GetStudentProfileJson, { message: string }>;

// Tipo exportado para uso en componentes
export type StudentProfileData = NonNullable<SuccessResponse["profile"]>;

export function useGetStudentProfile(userId: string) {
  const query = useQuery<StudentProfileData | undefined, Error>({
    queryKey: ["student-profile", userId],
    queryFn: async () => {
      const response = await client.api.profile[":id"].$get({
        param: { id: userId },
      });

      const jsonData = (await response.json()) as unknown as GetStudentProfileJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener el perfil del estudiante"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.profile;
    },
    enabled: !!userId,
  });

  return {
    profile: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
