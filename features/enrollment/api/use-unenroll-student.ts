import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type RequestType = {
  studentId: string
  courseId: string
}

type ResponseType = {
  message: string
  status: number
}

export function useUnenrollStudent() {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: unenrollStudent,
    mutateAsync: unenrollStudentAsync,
    isPending: isUnenrolling,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ studentId, courseId }) => {
      const response = await client.api.admin.enrollment[":studentId"][
        ":courseId"
      ].$delete({
        param: { studentId, courseId },
      })
      const data = await response.json()
      if (response.status !== 200) {
        const error = new Error(
          data.message || "Error al desmatricular estudiante"
        )
        ;(error as any).status = response.status
        ;(error as any).data = data
        throw error
      }
      return {
        ...data,
        status: response.status,
      }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["year-details"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })

  return { data, error, unenrollStudent, unenrollStudentAsync, isUnenrolling }
}

