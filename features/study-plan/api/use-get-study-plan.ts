import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetStudyPlanEndpoint =
  (typeof client.api.admin)["study-plan"][":id"]["$get"];
type GetStudyPlanResponse = Awaited<ReturnType<GetStudyPlanEndpoint>>;
type GetStudyPlanJson = Awaited<ReturnType<GetStudyPlanResponse["json"]>>;

type SuccessResponse = Extract<GetStudyPlanJson, { studyPlan: unknown }>;
type ErrorResponse = Extract<GetStudyPlanJson, { message: string }>;

export type StudyPlanDetails = NonNullable<SuccessResponse["studyPlan"]>;

export function useGetStudyPlan(id: string | undefined) {
  const query = useQuery<StudyPlanDetails, Error>({
    queryKey: ["study-plan", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await client.api.admin["study-plan"][":id"].$get({
        param: { id: id! },
      });
      const jsonData = (await response.json()) as unknown as GetStudyPlanJson;

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse;
        const error = new Error(
          errorData.message || "Error al obtener el plan de estudio"
        );
        Object.assign(error, { status: response.status });
        throw error;
      }

      const successData = jsonData as unknown as SuccessResponse;
      return successData.studyPlan;
    },
  });

  return {
    studyPlan: query.data,
    isPending: query.isPending,
    error: query.error,
  };
}
