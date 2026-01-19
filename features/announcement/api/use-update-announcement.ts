import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { Announcement } from "./use-get-announcements";
import { toast } from "sonner";

type UpdateAnnouncementEndpoint = (typeof client.api.announcement[":id"])["$put"]
type UpdateAnnouncementResponse = Awaited<ReturnType<UpdateAnnouncementEndpoint>>
type UpdateAnnouncementJson = Awaited<ReturnType<UpdateAnnouncementResponse["json"]>>
type RequestType = InferRequestType<typeof client.api.announcement[":id"]["$put"]>["json"]

type SuccessResponse = Extract<UpdateAnnouncementJson, { announcement: unknown }>
type ErrorResponse = Extract<UpdateAnnouncementJson, { message: string }>

type UseUpdateAnnouncementProps = {
    id: string
}

export function useUpdateAnnouncement(params: UseUpdateAnnouncementProps) {
    const queryClient = useQueryClient()

    const { data: announcement, isPending: isUpdatingAnnouncement, error } = useMutation<Announcement, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.announcement[":id"]["$put"]({
                param: { id: params.id },
                json
            })
            const jsonData = (await response.json()) as UpdateAnnouncementJson
            if (response.status !== 200) {
                const errorData = jsonData as ErrorResponse
                const error = new Error(
                    errorData.message
                )
                Object.assign(error, { status: response.status })
                throw error
            }

            const successData = jsonData as SuccessResponse
            return successData.announcement
        },
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success("Aviso actualizado exitosamente.")
            queryClient.invalidateQueries({ queryKey: ["announcements", data.courseSubjectId] })
        }
    })

    return { announcement, isUpdatingAnnouncement, error }
}