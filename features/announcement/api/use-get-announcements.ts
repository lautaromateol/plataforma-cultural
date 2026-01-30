import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

type GetAnnouncementsEndpoint = (typeof client.api.announcement)[":subjectId"]["$get"]
type GetAnnouncementsResponse = Awaited<ReturnType<GetAnnouncementsEndpoint>>;
type GetAnnouncementsJson = Awaited<ReturnType<GetAnnouncementsResponse["json"]>>;

type SuccessResponse = Extract<GetAnnouncementsJson, { announcements: unknown }>;
type ErrorResponse = Extract<GetAnnouncementsJson, { message: string }>;

export type Announcement = NonNullable<SuccessResponse["announcements"]>[number]

type UseGetAnnouncementsParams = {
    subjectId: string
}

export function useGetAnnouncements(params: UseGetAnnouncementsParams) {
    const { data: announcements, isPending: isLoadingAnnouncements, error } = useQuery<Announcement[], Error>({
        queryKey: ["announcements", params.subjectId],
        queryFn: async () => {
            const response = await client.api.announcement[":subjectId"]["$get"]({
                param: { subjectId: params.subjectId }
            })

            const jsonData = (await response.json()) as GetAnnouncementsJson

            if (response.status !== 200) {
                const errorData = jsonData as ErrorResponse
                const error = new Error(
                    errorData.message
                )
                Object.assign(error, { status: response.status })
                throw error
            }

            const successData = jsonData as SuccessResponse
            return successData.announcements
        }
    })

    return {
        announcements,
        isLoadingAnnouncements,
        error
    }
}