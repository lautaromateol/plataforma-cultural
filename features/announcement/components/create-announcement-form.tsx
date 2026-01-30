import { useForm } from "react-hook-form"
import z from "zod"
import { createAnnouncementSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCreateAnnouncement } from "../api/use-create-announcement"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Megaphone, Loader2 } from "lucide-react"

interface CreateAnnouncementFormProps {
    subjectId: string;
}

export function CreateAnnouncementForm({ subjectId }: CreateAnnouncementFormProps) {

    const { createAnnouncement, isCreatingAnnouncement } = useCreateAnnouncement({ subjectId })

    const form = useForm<z.infer<typeof createAnnouncementSchema>>({
        resolver: zodResolver(createAnnouncementSchema),
        defaultValues: {
            title: "",
            message: "",
        }
    })

    async function onSubmit(data: z.infer<typeof createAnnouncementSchema>) {
        createAnnouncement(data)
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-8">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Form {...form}>
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 pb-2">
                            <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Nuevo Aviso</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Notifica a los estudiantes sobre cambios importantes</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-medium text-sm">Título</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Cambio de horario de clase"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                                disabled={isCreatingAnnouncement}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-medium text-sm">Mensaje</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Escribe el contenido del aviso aquí..."
                                                rows={5}
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                                                disabled={isCreatingAnnouncement}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isCreatingAnnouncement}
                                className="rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 min-w-[160px] text-white font-medium"
                            >
                                {isCreatingAnnouncement ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    "Publicar Aviso"
                                )}
                            </Button>
                        </div>
                    </div>
                </Form>
            </form>
        </div>
    )
}