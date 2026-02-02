import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateStudentProfile } from "../schemas";
import { client } from "@/lib/client";
import { toast } from "sonner";

type UpdateStudentProfileEndpoint = (typeof client.api.profile)[":id"]["$patch"];
type UpdateStudentProfileResponse = Awaited<ReturnType<UpdateStudentProfileEndpoint>>;
type UpdateStudentProfileJson = Awaited<
    ReturnType<UpdateStudentProfileResponse["json"]>
>;

type UpdateSuccessResponse = Extract<
    UpdateStudentProfileJson,
    { profile: unknown }
>;
type UpdateErrorResponse = Extract<
    UpdateStudentProfileJson,
    { message: string }
>;


type UpdateStudentProfileProps = {
    userId: string;
}

export function useUpdateStudentProfile({ userId }: UpdateStudentProfileProps) {
    const queryClient = useQueryClient()
    const { mutate: updateStudentProfile, isPending: isUpdatingStudentProfile, error } = useMutation<UpdateSuccessResponse, Error, UpdateStudentProfile>({
        mutationFn: async (data) => {
            const response = await client.api.profile[":id"]["$patch"]({
                param: { id: userId },
                json: {
                    ...data,
                },
            });

            const jsonData = (await response.json()) as UpdateStudentProfileJson;

            if (response.status !== 200) {
                const errorData = jsonData as UpdateErrorResponse;
                const error = new Error(
                    errorData.message || "Error al actualizar el perfil del estudiante"
                );
                Object.assign(error, { status: response.status });
                throw error;
            }

            const successData = jsonData as UpdateSuccessResponse;
            return successData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["student-profile", data.profile.userId]
            })
            toast.success("Perfil del estudiante actualizado con éxito");
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar el perfil del estudiante")
        }
    });

    return { updateStudentProfile, isUpdatingStudentProfile, error };
}