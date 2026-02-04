import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@/lib/client"
import { useGetUser } from "@/features/auth/api/use-get-user"
import { UpdateAssignmentGradeInput } from "../schemas"

const getEndpoint = () => (client.api as any).grades.assignment["$patch"]

type UpdateAssignmentGradeEndpoint = ReturnType<typeof getEndpoint>
type UpdateAssignmentGradeResponse = Awaited<ReturnType<UpdateAssignmentGradeEndpoint>>
type UpdateAssignmentGradeJson = Awaited<ReturnType<UpdateAssignmentGradeResponse["json"]>>

type SuccessResponse = Extract<UpdateAssignmentGradeJson, { submission: unknown }>
type ErrorResponse = Extract<UpdateAssignmentGradeJson, { message: string }>

export function useUpdateAssignmentGrade() {
  const queryClient = useQueryClient()
  const { user } = useGetUser()

  const mutation = useMutation<
    SuccessResponse,
    Error,
    UpdateAssignmentGradeInput
  >({
    mutationFn: async (data: UpdateAssignmentGradeInput) => {
      const response = await (client.api as any).grades.assignment.$patch({
        json: data,
      })
      const jsonData = (await response.json()) as unknown as UpdateAssignmentGradeJson

      if (response.status !== 200) {
        const errorData = jsonData as unknown as ErrorResponse
        const error = new Error(
          errorData.message || "Error al actualizar la calificación"
        )
        Object.assign(error, { status: response.status, data: errorData })
        throw error
      }

      return jsonData as unknown as SuccessResponse
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
