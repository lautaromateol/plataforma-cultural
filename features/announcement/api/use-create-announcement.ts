"use client";
import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { toast } from "sonner";

type CreateAnnouncementEndpoint = (typeof client.api.announcement)[":subjectId"]["$post"];
type CreateAnnouncementResponse = Awaited<ReturnType<CreateAnnouncementEndpoint>>
type CreateAnnouncementJson = Awaited<ReturnType<CreateAnnouncementResponse["json"]>>
type RequestType = InferRequestType<typeof client.api.announcement[":subjectId"]["$post"]>["json"]

type SuccessResponse = Extract<CreateAnnouncementJson, { announcement: unknown }>
type ErrorResponse = Extract<CreateAnnouncementJson, { message: string }>

type CreateAnnouncementResponseData = Exclude<CreateAnnouncementJson, ErrorResponse>

type UseCreateAnnouncementProps = {
    subjectId: string;
}

export function useCreateAnnouncement(params: UseCreateAnnouncementProps) {
    const queryClient = useQueryClient()

    const { data: announcement, mutate: createAnnouncement, isPending: isCreatingAnnouncement, error } = useMutation<CreateAnnouncementResponseData["announcement"], Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.announcement[":subjectId"]["$post"]({
                param: { subjectId: params.subjectId },
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
            queryClient.invalidateQueries({ queryKey: ["announcements", data.subjectId] })
        }
    })

    return { announcement, createAnnouncement, isCreatingAnnouncement, error }
}