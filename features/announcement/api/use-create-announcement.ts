import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Announcement } from "./use-get-announcements";
import { InferRequestType } from "hono";
import { toast } from "sonner";

type CreateAnnouncementEndpoint = (typeof client.api.announcement)[":courseSubjectId"]["$post"];
type CreateAnnouncementResponse = Awaited<ReturnType<CreateAnnouncementEndpoint>>
type CreateAnnouncementJson = Awaited<ReturnType<CreateAnnouncementResponse["json"]>>
type RequestType = InferRequestType<typeof client.api.announcement[":courseSubjectId"]["$post"]>["json"]

type SuccessResponse = Extract<CreateAnnouncementJson, { announcement: unknown }>
type ErrorResponse = Extract<CreateAnnouncementJson, { message: string }>

type UseCreateAnnouncementProps = {
    courseSubjectId: string;
}

export function useCreateAnnouncement(params: UseCreateAnnouncementProps) {
    const queryClient = useQueryClient()

    const { data: announcement, isPending: isCreatingAnnouncement, error } = useMutation<Announcement, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.announcement[":courseSubjectId"]["$post"]({
                param: { courseSubjectId: params.courseSubjectId },
                json
            })

            const jsonData = (await response.json()) as CreateAnnouncementJson
            if (response.status !== 200) {
                const errorData = jsonData as ErrorResponse
                const error = new Error(
                    errorData.message
                )
                Object.assign(
                    error, { status: response.status }
                )
                throw error
            }
            const successData = jsonData as SuccessResponse

            return successData.announcement
        },
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success("Aviso creado exitosamente.")
            queryClient.invalidateQueries({ queryKey: ["announcements", data.courseSubjectId] })
        }
    })

    return { announcement, isCreatingAnnouncement, error }
}