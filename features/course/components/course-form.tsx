"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Course, createCourseSchema, updateCourseSchema } from "../schemas"
import { useCreateCourse } from "../api/use-create-course"
import { useUpdateCourse } from "../api/use-update-course"
import { useGetLevels } from "@/features/level/api/use-get-levels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

interface CourseFormProps {
  initialData?: Course
  onSuccess?: () => void
}

type CourseFormData = z.infer<typeof createCourseSchema> | z.infer<typeof updateCourseSchema>

export function CourseForm({ initialData, onSuccess }: CourseFormProps) {
  const isEdit = !!initialData
  const { levels, isPending: isLoadingLevels } = useGetLevels()

  const schema = isEdit ? updateCourseSchema : createCourseSchema

  const form = useForm<CourseFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      academicYear: initialData?.academicYear ?? new Date().getFullYear().toString(),
      capacity: initialData?.capacity ?? 30,
      classroom: initialData?.classroom ?? "",
      levelId: initialData?.levelId ?? "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        academicYear: initialData.academicYear ?? new Date().getFullYear().toString(),
        capacity: initialData.capacity ?? 30,
        classroom: initialData.classroom ?? "",
        levelId: initialData.levelId ?? "",
      })
    }
  }, [initialData, form])

  const { createCourseAsync, isCreatingCourse } = useCreateCourse()
  const { updateCourseAsync, isUpdatingCourse } = useUpdateCourse()

  async function onSubmit(data: CourseFormData) {
    try {
      if (isEdit) {
        const { levelId, ...updateData } = data as z.infer<typeof createCourseSchema>
        await updateCourseAsync({ id: initialData!.id, data: updateData as any })
        toast.success("Curso actualizado exitosamente")
      } else {
        await createCourseAsync(data as any)
        toast.success("Curso creado exitosamente")
      }
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.message || (isEdit ? "Error al actualizar el curso" : "Error al crear el curso")
      toast.error(errorMessage)
      console.error("Error submitting form:", error)
    }
  }

  const isPending = isCreatingCourse || isUpdatingCourse

  if (isLoadingLevels) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!levels || levels.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atención</AlertTitle>
            <AlertDescription>
              No hay niveles disponibles. Debes crear al menos un nivel
              antes de crear cursos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar Curso" : "Crear Curso"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifica la información del curso"
            : "Completa los datos para crear un nuevo curso (grupo de estudiantes)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="levelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel *</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isPending || isEdit}
                      placeholder="Selecciona un nivel"
                    >
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name} - {level.studyPlan?.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Curso *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 1°A, 1°B, 2°A..."
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
                      type="text"
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
                        placeholder="Ej: Aula 101 (opcional)"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>{isEdit ? "Actualizar" : "Crear"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

