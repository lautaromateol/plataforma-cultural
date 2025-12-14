import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

const getEndpoint = () => (client.api as any).quiz[":id"]["attempts"]["$get"]
type GetQuizAttemptsEndpoint = ReturnType<typeof getEndpoint>
type GetQuizAttemptsResponse = Awaited<ReturnType<GetQuizAttemptsEndpoint>>
type GetQuizAttemptsJson = Awaited<ReturnType<GetQuizAttemptsResponse["json"]>>

type SuccessResponse = Extract<GetQuizAttemptsJson, { attempts: unknown }>
type ErrorResponse = Extract<GetQuizAttemptsJson, { message: string }>

export function useGetQuizAttempts(quizId: string) {
  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["quiz-attempts", quizId],
    queryFn: async () => {
      const response = await (client.api as any).quiz[":id"]["attempts"].$get({
        param: { id: quizId },
      })

      const jsonData = (await response.json()) as unknown as GetQuizAttemptsJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al obtener los intentos")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    enabled: !!quizId,
  })

  return {
    attempts: query.data?.attempts,
    isPending: query.isPending,
    error: query.error,
  }
}
