import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType } from "hono"

type RequestType = InferRequestType<
  (typeof client.api.admin.enrollment)["$post"]
>["json"]

type ResponseType = {
  message: string
  enrollment?: any
  status: number
}

export function useEnrollStudent() {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    mutate: enrollStudent,
    mutateAsync: enrollStudentAsync,
    isPending: isEnrolling,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.enrollment.$post({ json })
      const data = await response.json()
      if (response.status !== 201) {
        const error = new Error(data.message || "Error al matricular estudiante")
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

  return { data, error, enrollStudent, enrollStudentAsync, isEnrolling }
}

