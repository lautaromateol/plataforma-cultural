"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createSubjectSchema } from "@/features/subject/schemas"
import { useCreateSubject } from "@/features/subject/api/use-create-subject"
import { useUpdateSubject } from "@/features/subject/api/use-update-subject"
import { Loader2 } from "lucide-react"
import { useOpenSubjectDialog } from "../hooks/use-open-subject-dialog"

type SubjectFormData = z.infer<typeof createSubjectSchema>

export function SubjectForm() {
  const { isOpen, close, yearId, subject: initialData } = useOpenSubjectDialog()
  const isEdit = !!initialData
  const { createSubjectAsync, isCreatingSubject } = useCreateSubject()
  const { updateSubjectAsync, isUpdatingSubject } = useUpdateSubject()

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        code: initialData.code ?? "",
        description: initialData.description ?? "",
      })
    } else {
      form.reset({
        name: "",
        code: "",
        description: "",
      })
    }
  }, [isOpen, initialData, form])

  const isPending = isCreatingSubject || isUpdatingSubject

  async function onSubmit(data: SubjectFormData) {
    try {
      if (isEdit && initialData) {
        await updateSubjectAsync({ id: initialData.id, data })
        toast.success("Materia actualizada exitosamente")
      } else {
        await createSubjectAsync({ data, yearId })
        toast.success("Materia creada exitosamente")
      }
      form.reset()
      close()
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isEdit ? "Error al actualizar la materia" : "Error al crear la materia")
      toast.error(errorMessage)
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Editar Materia" : "Crear Materia"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Materia *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Matemáticas"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: MAT-101"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de la materia"
                    disabled={isPending}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
