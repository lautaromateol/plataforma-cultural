import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { correctAnswerSchema } from "../schemas"

type RequestType = z.infer<typeof correctAnswerSchema>

const getEndpoint = () => (client.api as any).quiz["answer"]["correct"]["$post"]
type CorrectAnswerEndpoint = ReturnType<typeof getEndpoint>
type CorrectAnswerResponse = Awaited<ReturnType<CorrectAnswerEndpoint>>
type CorrectAnswerJson = Awaited<ReturnType<CorrectAnswerResponse["json"]>>

type SuccessResponse = Extract<CorrectAnswerJson, { message: string; answer: unknown }>
type ErrorResponse = Extract<CorrectAnswerJson, { message: string }>

export function useCorrectAnswer(attemptId: string) {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: correctAnswer,
    mutateAsync: correctAnswerAsync,
    isPending: isCorrectingAnswer,
  } = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await (client.api as any).quiz["answer"]["correct"].$post({ json })

      const jsonData = (await response.json()) as unknown as CorrectAnswerJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al corregir la respuesta")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempt", attemptId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al corregir la respuesta")
    },
  })

  return { data, error, correctAnswer, correctAnswerAsync, isCorrectingAnswer }
}
