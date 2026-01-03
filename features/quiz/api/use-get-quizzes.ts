import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

const getEndpoint = () => (client.api as any).quiz[":subjectId"]["$get"]
type GetQuizzesEndpoint = ReturnType<typeof getEndpoint>
type GetQuizzesResponse = Awaited<ReturnType<GetQuizzesEndpoint>>
type GetQuizzesJson = Awaited<ReturnType<GetQuizzesResponse["json"]>>

type SuccessResponse = Extract<GetQuizzesJson, { quizzes: unknown }>
type ErrorResponse = Extract<GetQuizzesJson, { message: string }>

export function useGetQuizzes(subjectId: string) {
  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["quizzes", subjectId],
    queryFn: async () => {
      const response = await (client.api as any).quiz[":subjectId"].$get({
        param: { subjectId },
      })

      const jsonData = (await response.json()) as unknown as GetQuizzesJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al obtener cuestionarios")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    enabled: !!subjectId,
  })

  return {
    quizzes: query.data?.quizzes,
    isPending: query.isPending,
    error: query.error,
  }
}
