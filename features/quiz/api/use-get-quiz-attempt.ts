import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

const getEndpoint = () => (client.api as any).quiz["attempt"][":id"]["$get"]
type GetQuizAttemptEndpoint = ReturnType<typeof getEndpoint>
type GetQuizAttemptResponse = Awaited<ReturnType<GetQuizAttemptEndpoint>>
type GetQuizAttemptJson = Awaited<ReturnType<GetQuizAttemptResponse["json"]>>

type SuccessResponse = Extract<GetQuizAttemptJson, { attempt: unknown }>
type ErrorResponse = Extract<GetQuizAttemptJson, { message: string }>

export function useGetQuizAttempt(attemptId: string) {
  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: async () => {
      const response = await (client.api as any).quiz["attempt"][":id"].$get({
        param: { id: attemptId },
      })

      const jsonData = (await response.json()) as unknown as GetQuizAttemptJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al obtener el intento")
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
