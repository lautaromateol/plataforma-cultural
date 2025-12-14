import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

const getEndpoint = () => (client.api as any).quiz["attempt"][":id"]["review"]["$get"]
type GetQuizReviewEndpoint = ReturnType<typeof getEndpoint>
type GetQuizReviewResponse = Awaited<ReturnType<GetQuizReviewEndpoint>>
type GetQuizReviewJson = Awaited<ReturnType<GetQuizReviewResponse["json"]>>

type SuccessResponse = Extract<GetQuizReviewJson, { attempt: unknown }>
type ErrorResponse = Extract<GetQuizReviewJson, { message: string }>

export function useGetQuizReview(attemptId: string) {
  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["quiz-review", attemptId],
    queryFn: async () => {
      const response = await (client.api as any).quiz["attempt"][":id"]["review"].$get({
        param: { id: attemptId },
      })

      const jsonData = (await response.json()) as unknown as GetQuizReviewJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al obtener la revisión")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    enabled: !!attemptId,
  })

  return {
    attempt: query.data?.attempt,
    isPending: query.isPending,
    error: query.error,
  }
}
