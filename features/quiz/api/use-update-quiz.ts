import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { updateQuizSchema } from "../schemas"

type RequestType = z.infer<typeof updateQuizSchema> & { id: string }

const getEndpoint = () => (client.api as any).quiz[":id"]["$patch"]
type UpdateQuizEndpoint = ReturnType<typeof getEndpoint>
type UpdateQuizResponse = Awaited<ReturnType<UpdateQuizEndpoint>>
type UpdateQuizJson = Awaited<ReturnType<UpdateQuizResponse["json"]>>

type SuccessResponse = Extract<UpdateQuizJson, { message: string; quiz: unknown }>
type ErrorResponse = Extract<UpdateQuizJson, { message: string }>

export function useUpdateQuiz() {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: updateQuiz,
    mutateAsync: updateQuizAsync,
    isPending: isUpdatingQuiz,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async ({ id, ...json }) => {
      const response = await (client.api as any).quiz[":id"].$patch({
        param: { id },
        json,
      })

      const jsonData = (await response.json()) as unknown as UpdateQuizJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al actualizar cuestionario")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    onSuccess: (data) => {
      toast.success(data.message)
      if (data.quiz) {
        const quiz = data.quiz as any
        queryClient.invalidateQueries({
          queryKey: ["quiz", quiz.id],
        })
        queryClient.invalidateQueries({
          queryKey: ["quizzes", quiz.subjectId],
        })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar cuestionario")
    },
  })

  return { data, error, updateQuiz, updateQuizAsync, isUpdatingQuiz }
}
