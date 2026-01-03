import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { submitAnswerSchema } from "../schemas"

type RequestType = z.infer<typeof submitAnswerSchema>

const getEndpoint = () => (client.api as any).quiz["answer"]["$post"]
type SubmitAnswerEndpoint = ReturnType<typeof getEndpoint>
type SubmitAnswerResponse = Awaited<ReturnType<SubmitAnswerEndpoint>>
type SubmitAnswerJson = Awaited<ReturnType<SubmitAnswerResponse["json"]>>

type SuccessResponse = Extract<SubmitAnswerJson, { answer: unknown }>
type ErrorResponse = Extract<SubmitAnswerJson, { message: string }>

export function useSubmitAnswer(attemptId: string) {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: submitAnswer,
    mutateAsync: submitAnswerAsync,
    isPending: isSubmittingAnswer,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).quiz["answer"].$post({ json })

      const jsonData = (await response.json()) as unknown as SubmitAnswerJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al enviar la respuesta")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempt", attemptId],
      })
    },
    onError: (error: Error) => {
      console.error("Error al enviar respuesta:", error)
    },
  })

  return { data, error, submitAnswer, submitAnswerAsync, isSubmittingAnswer }
}
