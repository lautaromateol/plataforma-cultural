"use client"

import * as React from "react"
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createQuizSchema } from "../schemas"
import { useCreateQuiz } from "../api/use-create-quiz"
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
  FormDescription,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"

interface CreateQuizDialogProps {
  subjectId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateQuizDialog({
  subjectId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateQuizDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const { createQuizAsync, isCreatingQuiz } = useCreateQuiz()

  const form = useForm<z.infer<typeof createQuizSchema>>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 60,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowReview: false,
      allowRetries: false,
      subjectId,
      questions: [
        {
          statement: "",
          type: "SINGLE_CHOICE",
          hasAutoCorrection: false,
          points: 1,
          order: 0,
          options: [],
          correctTextAnswer: "",
        },
      ],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  async function onSubmit(data: z.infer<typeof createQuizSchema>) {
    try {
      // Limpiar correctTextAnswer si está vacío o si no es tipo TEXT
      const cleanedData = {
        ...data,
        questions: data.questions.map((q) => ({
          ...q,
          correctTextAnswer: q.type === "TEXT" && q.hasAutoCorrection && q.correctTextAnswer
            ? q.correctTextAnswer.trim()
            : undefined,
        })),
      }
      await createQuizAsync(cleanedData)
      form.reset()
      setOpen(false)
    } catch (error: any) {
      console.error("Error al crear cuestionario:", error)
      // El error ya se muestra en el hook useCreateQuiz
    }
  }

  const addQuestion = () => {
    append({
      statement: "",
      type: "SINGLE_CHOICE",
      hasAutoCorrection: false,
      points: 1,
      order: fields.length,
      options: [],
      correctTextAnswer: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Cuestionario</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Cuestionario</DialogTitle>
          <DialogDescription>
            Completa los datos del cuestionario y agrega las preguntas
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Examen Parcial de Matemática" />
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
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descripción del cuestionario..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiempo límite (minutos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha y hora de inicio</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            value={field.value ? (() => {
                              // Convertir ISO string (UTC) a hora local para mostrar
                              const date = new Date(field.value)
                              // Obtener componentes en hora local (getFullYear, getMonth, etc. ya devuelven hora local)
                              const year = date.getFullYear()
                              const month = String(date.getMonth() + 1).padStart(2, "0")
                              const day = String(date.getDate()).padStart(2, "0")
                              const hours = String(date.getHours()).padStart(2, "0")
                              const minutes = String(date.getMinutes()).padStart(2, "0")
                              return `${year}-${month}-${day}T${hours}:${minutes}`
                            })() : ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                // datetime-local devuelve la hora en zona local
                                // Crear fecha interpretando como hora local
                                const localDateString = e.target.value
                                const [datePart, timePart] = localDateString.split("T")
                                const [year, month, day] = datePart.split("-").map(Number)
                                const [hours, minutes] = timePart.split(":").map(Number)
                                
                                // Crear fecha en hora local (JavaScript interpreta como hora local)
                                const localDate = new Date(year, month - 1, day, hours, minutes)
                                // Convertir a ISO string (esto convierte correctamente de hora local a UTC)
                                field.onChange(localDate.toISOString())
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y hora de cierre</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            field.onChange(date.toISOString())
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="allowReview"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Permitir revisión</FormLabel>
                          <FormDescription>
                            Los alumnos podrán ver sus respuestas después de enviar
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="allowRetries"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Permitir reintentos</FormLabel>
                          <FormDescription>
                            Los alumnos podrán realizar el cuestionario múltiples veces
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preguntas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Preguntas</CardTitle>
                <Button type="button" onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <QuestionForm
                    key={field.id}
                    index={index}
                    form={form}
                    onRemove={() => remove(index)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingQuiz}>
                {isCreatingQuiz ? "Creando..." : "Crear Cuestionario"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface QuestionFormProps {
  index: number
  form: ReturnType<typeof useForm<z.infer<typeof createQuizSchema>>>
  onRemove: () => void
  canRemove: boolean
}

function QuestionForm({ index, form, onRemove, canRemove }: QuestionFormProps) {
  const questionType = form.watch(`questions.${index}.type`)
  const hasAutoCorrection = form.watch(`questions.${index}.hasAutoCorrection`)

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${index}.options`,
  })

  const addOption = () => {
    appendOption({
      text: "",
      isCorrect: false,
      order: optionFields.length,
    })
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pregunta {index + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={`questions.${index}.statement`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enunciado</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Escribe la pregunta aquí..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de pregunta</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="TEXT">Respuesta abierta</option>
                    <option value="SINGLE_CHOICE">Opción única</option>
                    <option value="MULTIPLE_CHOICE">Opción múltiple</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questions.${index}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puntos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE") && (
          <>
            <FormField
              control={form.control}
              name={`questions.${index}.hasAutoCorrection`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Corrección automática</FormLabel>
                    <FormDescription>
                      Marca las opciones correctas para que se corrija automáticamente
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Opciones de respuesta</FormLabel>
                <Button type="button" onClick={addOption} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Opción
                </Button>
              </div>
              {optionFields.map((optionField, optionIndex) => (
                <div key={optionField.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`questions.${index}.options.${optionIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Opción ${optionIndex + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {hasAutoCorrection && (
                    <FormField
                      control={form.control}
                      name={`questions.${index}.options.${optionIndex}.isCorrect`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Correcta</FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {optionFields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {optionFields.length < 2 && (
                <p className="text-sm text-muted-foreground">
                  Debe haber al menos 2 opciones
                </p>
              )}
            </div>
          </>
        )}

        {questionType === "TEXT" && (
          <>
            <FormField
              control={form.control}
              name={`questions.${index}.hasAutoCorrection`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Corrección automática</FormLabel>
                    <FormDescription>
                      Si está marcado, se comparará la respuesta del alumno con la respuesta esperada
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {hasAutoCorrection && (
              <FormField
                control={form.control}
                name={`questions.${index}.correctTextAnswer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respuesta correcta esperada</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ingresa la respuesta correcta para comparación exacta"
                      />
                    </FormControl>
                    <FormDescription>
                      La respuesta del alumno se comparará exactamente con este texto (sin distinguir mayúsculas/minúsculas)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
