"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGradeAssignment } from "../api/use-grade-assignment";
import { Loader2 } from "lucide-react";

const gradeSchema = z.object({
  grade: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});

type GradeFormValues = z.infer<typeof gradeSchema>;

interface GradeAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  currentGrade?: number | null;
  currentFeedback?: string | null;
  hasGrade: boolean;
}

export function GradeAssignmentDialog({
  open,
  onOpenChange,
  submissionId,
  currentGrade,
  currentFeedback,
  hasGrade,
}: GradeAssignmentDialogProps) {
  const { gradeAssignmentAsync, isGradingAssignment } = useGradeAssignment();

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade: currentGrade ?? undefined,
      feedback: currentFeedback ?? undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        grade: currentGrade ?? undefined,
        feedback: currentFeedback ?? undefined,
      });
    }
  }, [open, currentGrade, currentFeedback, form]);

  async function onSubmit(data: GradeFormValues) {
    try {
      await gradeAssignmentAsync({
        submissionId,
        grade: data.grade,
        feedback: data.feedback,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error al calificar:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calificar Entrega</DialogTitle>
          <DialogDescription>
            Ingresa la calificación y comentarios para esta entrega
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {hasGrade && (
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calificación</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        disabled={isGradingAssignment}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Calificación de 0 a 100 (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios sobre la entrega (opcional)"
                      disabled={isGradingAssignment}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGradingAssignment}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isGradingAssignment}>
                {isGradingAssignment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Calificación"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
