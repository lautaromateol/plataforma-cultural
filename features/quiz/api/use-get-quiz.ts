import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

const getEndpoint = () => (client.api as any).quiz["detail"][":id"]["$get"]
type GetQuizEndpoint = ReturnType<typeof getEndpoint>
type GetQuizResponse = Awaited<ReturnType<GetQuizEndpoint>>
type GetQuizJson = Awaited<ReturnType<GetQuizResponse["json"]>>

type SuccessResponse = Extract<GetQuizJson, { quiz: unknown }>
type ErrorResponse = Extract<GetQuizJson, { message: string }>

export function useGetQuiz(quizId: string) {
  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const response = await (client.api as any).quiz["detail"][":id"].$get({
        param: { id: quizId },
      })

      const jsonData = (await response.json()) as unknown as GetQuizJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al obtener el cuestionario")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    enabled: !!quizId,
  })

  return {
    quiz: query.data?.quiz,
    isPending: query.isPending,
    error: query.error,
  }
}
