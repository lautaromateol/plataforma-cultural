"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createYearSchema } from "../schemas"
import { useCreateYear } from "../api/use-create-year"
import { useUpdateYear } from "../api/use-update-year"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface YearFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function YearForm({ initialData, onSuccess }: YearFormProps) {
  const isEdit = !!initialData
  const form = useForm<z.infer<typeof createYearSchema>>({
    resolver: zodResolver(createYearSchema),
    defaultValues: {
      level: initialData?.level ?? undefined,
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        level: initialData.level ?? undefined,
        name: initialData.name ?? "",
        description: initialData.description ?? "",
      })
    }
  }, [initialData, form])

  const { createYearAsync, isCreatingYear } = useCreateYear()
  const { updateYearAsync, isUpdatingYear } = useUpdateYear()

  async function onSubmit(data: z.infer<typeof createYearSchema>) {
    try {
      if (isEdit) {
        await updateYearAsync({ id: initialData.id, data })
        toast.success("Año escolar actualizado exitosamente")
      } else {
        await createYearAsync(data)
        toast.success("Año escolar creado exitosamente")
      }
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.message || (isEdit ? "Error al actualizar el año escolar" : "Error al crear el año escolar")
      toast.error(errorMessage)
      console.error("Error submitting form:", error)
    }
  }

  const isPending = isCreatingYear || isUpdatingYear

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Año Escolar" : "Crear Año Escolar"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifica la información del año escolar"
            : "Completa los datos para crear un nuevo año escolar"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={6}
                      placeholder="Ingrese el nivel (1-6)"
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Primer Año, Segundo Año..."
                      maxLength={64}
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
                      placeholder="Descripción opcional del año escolar"
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
