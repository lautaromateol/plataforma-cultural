import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetStudyPlansEndpoint =
  (typeof client.api.admin)["study-plan"]["$get"];
type GetStudyPlansResponse = Awaited<ReturnType<GetStudyPlansEndpoint>>;
type GetStudyPlansJson = Awaited<ReturnType<GetStudyPlansResponse["json"]>>;

type SuccessResponse = Extract<GetStudyPlansJson, { studyPlans: unknown }>;
type ErrorResponse = Extract<GetStudyPlansJson, { message: string }>;

export type StudyPlan = NonNullable<SuccessResponse["studyPlans"]>[number];

export function useGetStudyPlans() {
  const query = useQuery<StudyPlan[], Error>({
    queryKey: ["study-plans"],
    queryFn: async () => {
      const response = await client.api.admin["study-plan"].$get();
      const jsonData = (await response.json()) as unknown as GetStudyPlansJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener los planes de estudio"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.studyPlans;
    },
  });

  return {
    studyPlans: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
