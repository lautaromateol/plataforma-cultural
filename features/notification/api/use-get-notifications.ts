import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

const getEndpoint = () => (client.api as any).notification["$get"];
type GetNotificationsEndpoint = ReturnType<typeof getEndpoint>;
type GetNotificationsResponse = Awaited<ReturnType<GetNotificationsEndpoint>>;
type GetNotificationsJson = Awaited<ReturnType<GetNotificationsResponse["json"]>>;

type SuccessResponse = Extract<GetNotificationsJson, { notifications: unknown }>;
type ErrorResponse = Extract<GetNotificationsJson, { message: string }>;

export function useGetNotifications(enabled: boolean = true) {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery<SuccessResponse, Error>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await (client.api as any).notification.$get();

      const jsonData = (await response.json()) as unknown as GetNotificationsJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(errorData.message || "Error al obtener notificaciones");
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData;
    },
    enabled,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  return {
    notifications: data?.notifications,
    error,
    isLoading,
    isError,
    refetch,
  };
}
