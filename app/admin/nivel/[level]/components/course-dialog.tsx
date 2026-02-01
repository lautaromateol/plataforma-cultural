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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createCourseSchema } from "@/features/course/schemas"
import { useCreateCourse } from "@/features/course/api/use-create-course"
import { useUpdateCourse } from "@/features/course/api/use-update-course"
import { Loader2 } from "lucide-react"
import { useOpenCourseDialog } from "../hooks/use-open-course-dialog"

type CourseFormData = z.infer<typeof createCourseSchema>

export function CourseForm() {
  const { isOpen, close, yearId, course: initialData } = useOpenCourseDialog()
  const isEdit = !!initialData
  const { createCourseAsync, isCreatingCourse } = useCreateCourse()
  const { updateCourseAsync, isUpdatingCourse } = useUpdateCourse()

  const form = useForm<CourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      academicYear: new Date().getFullYear().toString(),
      capacity: 30,
      classroom: "",
      yearId: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        academicYear: initialData.academicYear ?? new Date().getFullYear().toString(),
        capacity: initialData.capacity ?? 30,
        classroom: initialData.classroom ?? "",
        yearId,
      })
    } else {
      form.reset({
        name: "",
        academicYear: new Date().getFullYear().toString(),
        capacity: 30,
        classroom: "",
        yearId,
      })
    }
  }, [isOpen, initialData, yearId, form])

  const isPending = isCreatingCourse || isUpdatingCourse

  async function onSubmit(data: CourseFormData) {
    try {
      if (isEdit && initialData) {
        await updateCourseAsync({ id: initialData.id, data })
        toast.success("Curso actualizado exitosamente")
      } else {
        await createCourseAsync(data)
        toast.success("Curso creado exitosamente")
      }
      form.reset()
      close()
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isEdit ? "Error al actualizar el curso" : "Error al crear el curso")
      toast.error(errorMessage)
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Editar Curso" : "Crear Curso"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Curso *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 1° Año A"
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
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año Académico *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 2024, 2025..."
                    maxLength={4}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidad *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="30"
                      disabled={isPending}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classroom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aula</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: A-101"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
