import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { createQuizSchema } from "../schemas"

type RequestType = z.infer<typeof createQuizSchema>

const getEndpoint = () => (client.api as any).quiz["$post"]
type CreateQuizEndpoint = ReturnType<typeof getEndpoint>
type CreateQuizResponse = Awaited<ReturnType<CreateQuizEndpoint>>
type CreateQuizJson = Awaited<ReturnType<CreateQuizResponse["json"]>>

type SuccessResponse = Extract<CreateQuizJson, { message: string; quiz: unknown }>
type ErrorResponse = Extract<CreateQuizJson, { message: string }>

export function useCreateQuiz() {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: createQuiz,
    mutateAsync: createQuizAsync,
    isPending: isCreatingQuiz,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).quiz.$post({ json })

      const jsonData = (await response.json()) as unknown as CreateQuizJson

      if (response.status !== 201 && response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al crear cuestionario")
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
          queryKey: ["quizzes", quiz.subjectId],
        })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear cuestionario")
    },
  })

  return { data, error, createQuiz, createQuizAsync, isCreatingQuiz }
}
