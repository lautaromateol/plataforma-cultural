import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { startQuizAttemptSchema } from "../schemas"

type RequestType = z.infer<typeof startQuizAttemptSchema>

const getEndpoint = () => (client.api as any).quiz["start"]["$post"]
type StartQuizAttemptEndpoint = ReturnType<typeof getEndpoint>
type StartQuizAttemptResponse = Awaited<ReturnType<StartQuizAttemptEndpoint>>
type StartQuizAttemptJson = Awaited<ReturnType<StartQuizAttemptResponse["json"]>>

type SuccessResponse = Extract<StartQuizAttemptJson, { attempt: unknown }>
type ErrorResponse = Extract<StartQuizAttemptJson, { message: string }>

export function useStartQuizAttempt() {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: startQuizAttempt,
    mutateAsync: startQuizAttemptAsync,
    isPending: isStartingAttempt,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).quiz["start"].$post({ json })

      const jsonData = (await response.json()) as unknown as StartQuizAttemptJson

      if (response.status !== 201 && response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al iniciar el cuestionario")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    onSuccess: (data) => {
      if (data.attempt) {
        const attempt = data.attempt as any
        queryClient.setQueryData(["quiz-attempt", attempt.id], data)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al iniciar el cuestionario")
    },
  })

  return { data, error, startQuizAttempt, startQuizAttemptAsync, isStartingAttempt }
}
