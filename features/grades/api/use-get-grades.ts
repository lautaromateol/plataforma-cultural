import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { useGetUser } from "@/features/auth/api/use-get-user"

const getEndpoint = () => (client.api).grades["$get"]

type GetGradesEndpoint = ReturnType<typeof getEndpoint>
type GetGradesResponse = Awaited<ReturnType<GetGradesEndpoint>>
type GetGradesJson = Awaited<ReturnType<GetGradesResponse["json"]>>

type SuccessResponse = Extract<
  GetGradesJson,
  { quizAttempts: unknown; assignmentSubmissions: unknown }
>
type ErrorResponse = Extract<GetGradesJson, { message: string }>

export type QuizAttemptGrade = SuccessResponse["quizAttempts"][number]
export type AssignmentSubmissionGrade = SuccessResponse["assignmentSubmissions"][number]

type GetGradesParams = {
  levelId?: string
  courseId?: string
}

export function useGetGrades(params?: GetGradesParams) {
  const { user } = useGetUser()

  const query = useQuery<SuccessResponse, Error>({
    queryKey: ["grades", user?.id, user?.role, params?.levelId, params?.courseId],
    queryFn: async () => {
      const queryParams: Record<string, string> = {}
      if (params?.levelId) queryParams.levelId = params.levelId
      if (params?.courseId) queryParams.courseId = params.courseId

      const response = await (client.api).grades.$get({
        query: queryParams,
      })
      const jsonData = (await response.json()) as GetGradesJson

      if (response.status !== 200) {
        const errorData = jsonData as ErrorResponse
        const error = new Error(
          errorData.message || "Error al obtener las calificaciones"
        )
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      return jsonData as SuccessResponse
    },
    enabled: !!user?.id,
  })

  return {
    quizAttempts: query.data?.quizAttempts,
    assignmentSubmissions: query.data?.assignmentSubmissions,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}
