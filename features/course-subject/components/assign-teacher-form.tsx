"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assignTeacherFormSchema,
  type AssignTeacherFormValues,
} from "../schemas";
import { useGetTeachers } from "@/features/user/api/use-get-teachers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectItem } from "@/components/ui/select";
import { Loader2, UserPlus, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type SubjectInfo = {
  id: string;
  name: string;
  code: string | null;
  courseSubjectId: string | null;
  schedule: string | null;
  teacher: {
    id: string;
    name: string;
    email: string | null;
  } | null;
};

interface AssignTeacherFormProps {
  subject: SubjectInfo;
  onSubmit: (data: AssignTeacherFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function AssignTeacherForm({
  subject,
  onSubmit,
  onCancel,
  isPending,
}: AssignTeacherFormProps) {
  const { teachers, isPending: isLoadingTeachers } = useGetTeachers();
  const isEdit = !!subject.courseSubjectId;

  const form = useForm<AssignTeacherFormValues>({
    resolver: zodResolver(assignTeacherFormSchema),
    defaultValues: {
      teacherId: subject.teacher?.id ?? "",
      schedule: subject.schedule ?? "",
    },
  });

  // Reset form when subject changes
  useEffect(() => {
    form.reset({
      teacherId: subject.teacher?.id ?? "",
      schedule: subject.schedule ?? "",
    });
  }, [subject, form]);

  const handleSubmit = (data: AssignTeacherFormValues) => {
    onSubmit(data);
  };

  if (isLoadingTeachers) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">
          No hay profesores disponibles. Debes crear al menos un profesor antes
          de asignar materias.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Subject Info */}
        <div className="p-3 rounded-lg bg-slate-50 border">
          <p className="text-sm font-medium">{subject.name}</p>
          {subject.code && (
            <p className="text-xs text-muted-foreground font-mono">
              {subject.code}
            </p>
          )}
        </div>

        {/* Teacher Select */}
        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profesor *</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  disabled={isPending}
                  placeholder="Seleccionar profesor..."
                >
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Schedule Input */}
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Lunes 8:00-10:00"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Indica el día y horario de la clase (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEdit ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Actualizar
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Asignar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

