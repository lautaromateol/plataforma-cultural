"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAssignmentSchema } from "../schemas";
import { useCreateAssignment } from "../api/use-create-assignment";
import { useUpdateAssignment } from "../api/use-update-assignment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetSubjectCourses } from "@/features/subject-resource/api/use-get-subject-courses";
import { useGetUser } from "@/features/auth/api/use-get-user";

type Assignment = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  hasGrade: boolean;
  assignmentCourseSubjects?: Array<{
    courseSubject: {
      id: string;
      course: {
        id: string;
        name: string;
      };
    };
  }>;
};

interface AssignmentFormProps {
  initialData?: Assignment;
  subjectId: string;
  availableCourses?: Array<{
    id: string;
    courseSubjectId: string;
    name: string;
    classroom: string | null;
    schedule: string | null;
    teacher: {
      id: string;
      name: string;
      email: string | null;
    } | null;
  }>;
  onSuccess?: () => void;
}

type AssignmentFormData = z.infer<typeof createAssignmentSchema>;

export function AssignmentForm({
  initialData,
  subjectId,
  availableCourses,
  onSuccess,
}: AssignmentFormProps) {
  const isEdit = !!initialData;
  const { user } = useGetUser();
  const { data: courses = [] } = useGetSubjectCourses(subjectId);

  // Obtener cursos disponibles del profesor para esta materia
  const teacherCourses = React.useMemo(() => {
    if (!courses || !user) return [];
    
    // Si es profesor, filtrar solo los cursos donde es profesor
    if (user.role === "TEACHER") {
      return courses.filter((course: any) => course.teacher?.id === user.id);
    }
    
    // Si es admin, mostrar todos los cursos
    return courses;
  }, [courses, user]);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      hasGrade: initialData?.hasGrade ?? true,
      courseSubjectIds: initialData?.assignmentCourseSubjects
        ? initialData.assignmentCourseSubjects.map((acs) => acs.courseSubject.id)
        : [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        dueDate: new Date(initialData.dueDate).toISOString(),
        hasGrade: initialData.hasGrade ?? true,
        courseSubjectIds: initialData.assignmentCourseSubjects
          ? initialData.assignmentCourseSubjects.map((acs) => acs.courseSubject.id)
          : [],
      });
    } else {
      form.reset({
        title: "",
        description: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        hasGrade: true,
        courseSubjectIds: [],
      });
    }
  }, [initialData, form]);

  const { createAssignmentAsync, isCreatingAssignment } = useCreateAssignment();
  const { updateAssignmentAsync, isUpdatingAssignment } = useUpdateAssignment();

  async function onSubmit(data: AssignmentFormData) {
    try {
      if (isEdit && initialData) {
        await updateAssignmentAsync({ id: initialData.id, ...data });
      } else {
        await createAssignmentAsync(data);
      }
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isEdit ? "Error al actualizar la entrega" : "Error al crear la entrega");
      toast.error(errorMessage);
      console.error("Error submitting form:", error);
    }
  }

  const isPending = isCreatingAssignment || isUpdatingAssignment;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Entrega" : "Crear Entrega"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifica la información de la entrega"
            : "Completa los datos para crear una nueva entrega"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Trabajo Práctico N°1"
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
                      placeholder="Descripción de la entrega (opcional)"
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isPending}
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          field.onChange(new Date(value).toISOString());
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Selecciona la fecha y hora límite para la entrega
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="courseSubjectIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Cursos *</FormLabel>
                    <FormDescription>
                      Selecciona los cursos para los que aplica esta entrega
                    </FormDescription>
                  </div>
                  {teacherCourses.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                      No tienes cursos asignados para esta materia
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {teacherCourses.map((course: any) => (
                        <FormField
                          key={course.courseSubjectId}
                          control={form.control}
                          name="courseSubjectIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={course.courseSubjectId}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(course.courseSubjectId)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, course.courseSubjectId])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== course.courseSubjectId
                                            )
                                          );
                                    }}
                                    disabled={isPending}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal flex-1 cursor-pointer">
                                  <div>
                                    <div className="font-medium">{course.name}</div>
                                    {course.classroom && (
                                      <div className="text-sm text-muted-foreground">
                                        {course.classroom}
                                      </div>
                                    )}
                                    {course.schedule && (
                                      <div className="text-sm text-muted-foreground">
                                        {course.schedule}
                                      </div>
                                    )}
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasGrade"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Con calificación</FormLabel>
                    <FormDescription>
                      Si está marcado, el profesor podrá calificar esta entrega
                    </FormDescription>
                  </div>
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
  );
}
