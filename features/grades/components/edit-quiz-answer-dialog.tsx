"use client"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useUpdateQuizGrade } from "../api/use-update-quiz-grade"
import { updateQuizGradeSchema, UpdateQuizGradeInput } from "../schemas"

type EditQuizAnswerDialogProps = {
  isOpen: boolean
  onClose: () => void
  answer: {
    id: string
    points: number | null
    isCorrect: boolean | null
    textAnswer: string | null
    question: {
      id: string
      statement: string
      points: number
    }
  }
  attemptId: string
  studentName: string
  quizTitle: string
}

export function EditQuizAnswerDialog({
  isOpen,
  onClose,
  answer,
  attemptId,
  studentName,
  quizTitle,
}: EditQuizAnswerDialogProps) {
  const { mutate, isPending } = useUpdateQuizGrade()

  const form = useForm<UpdateQuizGradeInput>({
    resolver: zodResolver(updateQuizGradeSchema),
    defaultValues: {
      attemptId,
      answerId: answer.id,
      points: answer.points || 0,
      isCorrect: answer.isCorrect || false,
    },
  })

  const onSubmit = (data: UpdateQuizGradeInput) => {
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
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Editar Respuesta de Quiz
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div className="text-base font-medium text-foreground">
              {quizTitle}
            </div>
            <div className="text-sm">
              Estudiante: <span className="font-medium">{studentName}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 border mb-4">
          <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-2">
            Pregunta
          </h4>
          <p className="text-foreground font-medium mb-3">{answer.question.statement}</p>

          {answer.textAnswer && (
            <div>
              <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-2">
                Respuesta del estudiante
              </h4>
              <p className="text-foreground bg-white dark:bg-slate-950 rounded p-3 border">
                {answer.textAnswer}
              </p>
            </div>
          )}

          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Puntos máximos: <span className="font-bold text-foreground">{answer.question.points}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Puntos Obtenidos
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max={answer.question.points}
                      placeholder="Ingrese los puntos"
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
              name="isCorrect"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-900">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-semibold cursor-pointer">
                      Marcar como correcta
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Indica si la respuesta es correcta o no
                    </p>
                  </div>
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
