"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateStudentProfileSchema, type UpdateStudentProfile } from "../schemas";
import { useUpdateStudentProfile } from "../api/use-update-student-profile";
import { type StudentProfileData } from "../api/use-get-student-profile";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type UserProfileFormProps = {
    userId: string;
    profile?: StudentProfileData;
    setIsEditMode?: (isEditMode: boolean) => void;
};

export function UserProfileForm({ userId, profile, setIsEditMode }: UserProfileFormProps) {
    const { updateStudentProfile, isUpdatingStudentProfile } = useUpdateStudentProfile({
        userId,
    });

    const form = useForm<UpdateStudentProfile>({
        resolver: zodResolver(updateStudentProfileSchema),
        defaultValues: {
            birthDate: profile?.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : null,
            phone: profile?.phone ?? "",
            guardianName: profile?.guardianName ?? "",
            guardianPhone: profile?.guardianPhone ?? "",
        },
    });

    const onSubmit = (data: UpdateStudentProfile) => {
        updateStudentProfile({
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : null,
        }, {
            onSuccess: () => {
                setIsEditMode?.(false)
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha de Nacimiento</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    disabled={isUpdatingStudentProfile}
                                    {...field}
                                    value={
                                        field.value
                                            ? new Date(field.value).toISOString().split('T')[0]
                                            : ''
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ingresa tu teléfono"
                                    disabled={isUpdatingStudentProfile}
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Responsable</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nombre del responsable"
                                    disabled={isUpdatingStudentProfile}
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="guardianPhone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono del Responsable</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Teléfono del responsable"
                                    disabled={isUpdatingStudentProfile}
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isUpdatingStudentProfile || !form.formState.isDirty}>
                    {isUpdatingStudentProfile ? "Actualizando..." : "Actualizar Perfil"}
                </Button>
            </form>
        </Form>
    );
}