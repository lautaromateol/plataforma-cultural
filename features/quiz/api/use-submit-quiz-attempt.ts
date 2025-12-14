import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { submitQuizAttemptSchema } from "../schemas"

type RequestType = z.infer<typeof submitQuizAttemptSchema>

const getEndpoint = () => (client.api as any).quiz["attempt"][":id"]["submit"]["$post"]
type SubmitQuizAttemptEndpoint = ReturnType<typeof getEndpoint>
type SubmitQuizAttemptResponse = Awaited<ReturnType<SubmitQuizAttemptEndpoint>>
type SubmitQuizAttemptJson = Awaited<ReturnType<SubmitQuizAttemptResponse["json"]>>

type SuccessResponse = Extract<SubmitQuizAttemptJson, { message: string; attempt: unknown }>
type ErrorResponse = Extract<SubmitQuizAttemptJson, { message: string }>

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: submitQuizAttempt,
    mutateAsync: submitQuizAttemptAsync,
    isPending: isSubmittingAttempt,
  } = useMutation<SuccessResponse, Error, { attemptId: string } & RequestType>({
    mutationFn: async ({ attemptId, ...json }) => {
      const response = await (client.api as any).quiz["attempt"][":id"]["submit"].$post({
        param: { id: attemptId },
        json,
      })

      const jsonData = (await response.json()) as unknown as SubmitQuizAttemptJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al enviar el cuestionario")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    onSuccess: (data) => {
      toast.success(data.message)
      if (data.attempt) {
        const attempt = data.attempt as any
        queryClient.invalidateQueries({
          queryKey: ["quiz-attempt", attempt.id],
        })
        queryClient.invalidateQueries({
          queryKey: ["quizzes", attempt.quiz.subjectId],
        })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al enviar el cuestionario")
    },
  })

  return { data, error, submitQuizAttempt, submitQuizAttemptAsync, isSubmittingAttempt }
}
