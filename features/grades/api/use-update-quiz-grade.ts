import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@/lib/client"
import { useGetUser } from "@/features/auth/api/use-get-user"
import { UpdateQuizGradeInput } from "../schemas"

const getEndpoint = () => (client.api as any).grades.quiz["$patch"]

type UpdateQuizGradeEndpoint = ReturnType<typeof getEndpoint>
type UpdateQuizGradeResponse = Awaited<ReturnType<UpdateQuizGradeEndpoint>>
type UpdateQuizGradeJson = Awaited<ReturnType<UpdateQuizGradeResponse["json"]>>

type SuccessResponse = Extract<
  UpdateQuizGradeJson,
  { attempt: unknown; answer: unknown }
>
type ErrorResponse = Extract<UpdateQuizGradeJson, { message: string }>

export function useUpdateQuizGrade() {
  const queryClient = useQueryClient()
  const { user } = useGetUser()

  const mutation = useMutation<
    SuccessResponse,
    Error,
    UpdateQuizGradeInput
  >({
    mutationFn: async (data: UpdateQuizGradeInput) => {
      const response = await (client.api).grades.quiz.$patch({
        json: data,
      })
      const jsonData = (await response.json()) as UpdateQuizGradeJson

      if (response.status !== 200) {
        const errorData = jsonData as ErrorResponse
        const error = new Error(
          errorData.message || "Error al actualizar la calificación"
        )
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      return jsonData as SuccessResponse
    },
    onSuccess: () => {
      toast.success("Calificación actualizada correctamente")
      // Invalidar solo las queries del usuario actual
      queryClient.invalidateQueries({
        queryKey: ["grades", user?.id],
        exact: false
      })
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar la calificación")
    },
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
