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

type DeleteAnnouncementResponseData = Exclude<DeleteAnnouncementJson, ErrorResponse>

type UseDeleteAnnouncementProps = {
    subjectId: string
}

export function useDeleteAnnouncement(params: UseDeleteAnnouncementProps) {
    const queryClient = useQueryClient()

    const { data: announcement, mutate: deleteAnnouncement, isPending: isDeletingAnnouncement, error } = useMutation<DeleteAnnouncementResponseData["announcement"], Error, string>({
        mutationFn: async (id: string) => {
            const response = await client.api.announcement[":id"]["$delete"]({
                param: { id }
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
        onSuccess: () => {
            toast.success("Aviso eliminado exitosamente.")
            queryClient.invalidateQueries({ queryKey: ["announcements", params.subjectId] })
        }
    })

    return { announcement, deleteAnnouncement, isDeletingAnnouncement, error }
}