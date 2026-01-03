import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Tipos inferidos automáticamente desde la ruta del servidor
type GetCampusEndpoint = (typeof client.api.campus)["$get"];
type GetCampusResponse = Awaited<ReturnType<GetCampusEndpoint>>;
type GetCampusJson = Awaited<ReturnType<GetCampusResponse["json"]>>;

type SuccessResponse = Extract<GetCampusJson, { user: unknown }>;
type ErrorResponse = Extract<GetCampusJson, { message: string }>;

// Tipos auxiliares para type guards y uso en componentes
export type StudentCampusData = Extract<SuccessResponse, { enrollment: unknown }>;
export type TeacherCampusData = Extract<SuccessResponse, { teaching: unknown }>;
export type AdminCampusData = Extract<SuccessResponse, { redirect: string }>;

// Tipo unión exportado para uso en componentes
export type CampusData = SuccessResponse;

// Type guards
export function isStudentData(data: CampusData): data is StudentCampusData {
  return data.user.role === "STUDENT";
}

export function isTeacherData(data: CampusData): data is TeacherCampusData {
  return data.user.role === "TEACHER";
}

export function isAdminData(data: CampusData): data is AdminCampusData {
  return data.user.role === "ADMIN";
}

export function useGetCampus() {
  const query = useQuery<CampusData, Error>({
    queryKey: ["campus"],
    queryFn: async () => {
      const response = await client.api.campus.$get();
      const jsonData = (await response.json()) as unknown as GetCampusJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener datos");
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
  });

  return {
    data: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}

