"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createSubjectSchema } from "../schemas"
import { useCreateSubject } from "../api/use-create-subject"
import { useUpdateSubject } from "../api/use-update-subject"
import { useGetYears } from "@/features/year/api/use-get-years"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface SubjectFormProps {
  initialData?: any
  onSuccess?: () => void
}

const formSchema = createSubjectSchema.extend({
  yearId: z.string().min(1, "El año escolar es requerido"),
})

export function SubjectForm({ initialData, onSuccess }: SubjectFormProps) {
  const isEdit = !!initialData
  const { years, isPending: isLoadingYears } = useGetYears()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      description: initialData?.description ?? "",
      yearId: initialData?.yearId ?? "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        code: initialData.code ?? "",
        description: initialData.description ?? "",
        yearId: initialData.yearId ?? "",
      })
    }
  }, [initialData, form])

  const { createSubjectAsync, isCreatingSubject } = useCreateSubject()
  const { updateSubjectAsync, isUpdatingSubject } = useUpdateSubject()

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (isEdit) {
        const { yearId, ...subjectData } = data
        await updateSubjectAsync({ id: initialData.id, data: subjectData })
        toast.success("Materia actualizada exitosamente")
      } else {
        const { yearId, ...subjectData } = data
        await createSubjectAsync({ data: subjectData, yearId })
        toast.success("Materia creada exitosamente")
      }
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.message || (isEdit ? "Error al actualizar la materia" : "Error al crear la materia")
      toast.error(errorMessage)
      console.error("Error submitting form:", error)
    }
  }

  const isPending = isCreatingSubject || isUpdatingSubject

  if (isLoadingYears) {
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

  if (!years || years.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atención</AlertTitle>
            <AlertDescription>
              No hay años escolares disponibles. Debes crear al menos un año
              escolar antes de crear materias.
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
          {isEdit ? "Editar Materia" : "Crear Materia"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifica la información de la materia"
            : "Completa los datos para crear una nueva materia"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="yearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año Escolar *</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isPending || isEdit}
                      placeholder="Selecciona un año escolar"
                    >
                      {years.map((year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} (Nivel {year.level})
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
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Matemática, Lengua, Historia..."
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
                      placeholder="Ej: MAT-1, LEN-1 (opcional)"
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
                      placeholder="Descripción opcional de la materia"
                      rows={3}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

