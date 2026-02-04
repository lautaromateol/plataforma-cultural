"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useUpdateAssignmentGrade } from "../api/use-update-assignment-grade"
import { updateAssignmentGradeSchema, UpdateAssignmentGradeInput } from "../schemas"

type EditAssignmentGradeDialogProps = {
  isOpen: boolean
  onClose: () => void
  submission: {
    id: string
    grade: number | null
    feedback: string | null
    student: {
      name: string
      email: string
    }
    assignment: {
      title: string
    }
  }
}

export function EditAssignmentGradeDialog({
  isOpen,
  onClose,
  submission,
}: EditAssignmentGradeDialogProps) {
  const { mutate, isPending } = useUpdateAssignmentGrade()

  const form = useForm<UpdateAssignmentGradeInput>({
    resolver: zodResolver(updateAssignmentGradeSchema),
    defaultValues: {
      submissionId: submission.id,
      grade: submission.grade || 0,
      feedback: submission.feedback || "",
    },
  })

  const onSubmit = (data: UpdateAssignmentGradeInput) => {
    mutate(data, {
      onSuccess: () => {
        onClose()
        form.reset()
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Editar Calificación
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div className="text-base font-medium text-foreground">
              {submission.assignment.title}
            </div>
            <div className="text-sm">
              Estudiante: <span className="font-medium">{submission.student.name}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Calificación (0-10)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="Ingrese la calificación"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="text-lg font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Retroalimentación (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe comentarios sobre la entrega..."
                      rows={4}
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              >
                {isPending ? "Guardando..." : "Guardar Calificación"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
