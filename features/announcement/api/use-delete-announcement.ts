import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { Announcement } from "./use-get-announcements";
import { toast } from "sonner";

type DeleteAnnouncementEndpoint = (typeof client.api.announcement[":id"]["$delete"])
type DeleteAnnouncementResponse = Awaited<ReturnType<DeleteAnnouncementEndpoint>>
type DeleteAnnouncementJson = Awaited<ReturnType<DeleteAnnouncementResponse["json"]>>

type SuccessResponse = Extract<DeleteAnnouncementJson, { announcement: unknown }>
type ErrorResponse = Extract<DeleteAnnouncementJson, { message: string }>

type UseDeleteAnnouncementProps = {
    id: string
}

export function useDeleteAnnouncement(params: UseDeleteAnnouncementProps) {
    const queryClient = useQueryClient()

    const { data: announcement, isPending: isDeletingAnnouncement, error } = useMutation<Announcement, Error>({
        mutationFn: async () => {
            const response = await client.api.announcement[":id"]["$delete"]({
                param: { id: params.id }
            })

            const jsonData = (await response.json()) as DeleteAnnouncementJson
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
            toast.success("Aviso eliminado exitosamente.")
            queryClient.invalidateQueries({ queryKey: ["announcements", data.courseSubjectId] })
        }
    })

    return { announcement, isDeletingAnnouncement, error }
}