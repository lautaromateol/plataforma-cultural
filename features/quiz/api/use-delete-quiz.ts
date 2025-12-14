import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type DeleteQuizResponse = Awaited<ReturnType<typeof getEndpoint>>
type DeleteQuizJson = Awaited<ReturnType<DeleteQuizResponse["json"]>>

const getEndpoint = () => (client.api as any).quiz[":id"]["$delete"]

type SuccessResponse = Extract<DeleteQuizJson, { message: string }>
type ErrorResponse = Extract<DeleteQuizJson, { message: string }>

export function useDeleteQuiz(subjectId: string) {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: deleteQuiz,
    mutateAsync: deleteQuizAsync,
    isPending: isDeletingQuiz,
  } = useMutation<SuccessResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await (client.api as any).quiz[":id"].$delete({
        param: { id },
      })

      const jsonData = (await response.json()) as unknown as DeleteQuizJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(errorData.message || "Error al eliminar cuestionario")
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      const successData = jsonData as unknown as SuccessResponse
      return successData
    },
    onSuccess: () => {
      toast.success("Cuestionario eliminado exitosamente")
      queryClient.invalidateQueries({
        queryKey: ["quizzes", subjectId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar cuestionario")
    },
  })

  return { data, error, deleteQuiz, deleteQuizAsync, isDeletingQuiz }
}
