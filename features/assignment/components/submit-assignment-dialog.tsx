"use client";

import * as React from "react";
import { useState, useCallback } from "react";
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useSubmitAssignment } from "../api/use-submit-assignment";
import {
  Upload,
  Loader2,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "Debes seleccionar un archivo"),
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
}

export function SubmitAssignmentDialog({
  open,
  onOpenChange,
  assignmentId,
}: SubmitAssignmentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { submitAssignmentAsync, isSubmittingAssignment } = useSubmitAssignment();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error("El archivo es demasiado grande. Máximo 50MB");
        return;
      }
      setSelectedFile(file);
      form.setValue("file", file);
    }
  }, [form]);

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue("file", undefined);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      toast.error("Debes seleccionar un archivo");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Subir el archivo al servidor
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Error al subir el archivo");
      }

      const { fileUrl, fileType, fileSize } = await uploadResponse.json();

      // Crear la entrega en la base de datos
      await submitAssignmentAsync({
        assignmentId,
        fileName: selectedFile.name,
        fileUrl: fileUrl,
        fileType: fileType || selectedFile.type,
        fileSize: fileSize || selectedFile.size,
      });

      toast.success("¡Entrega subida exitosamente!");
      form.reset();
      setSelectedFile(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir la entrega"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subir Entrega</DialogTitle>
          <DialogDescription>
            Selecciona el archivo que deseas entregar
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {!selectedFile ? (
                        <label
                          htmlFor="file-upload"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                            "hover:bg-accent transition-colors",
                            isUploading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click para subir</span> o arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOCX, TXT, etc. (MAX. 50MB)
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              handleFileSelect(e);
                              field.onChange(e.target.files?.[0]);
                            }}
                          />
                        </label>
                      ) : (
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                          <div className="flex-shrink-0">
                            {getFileIcon(selectedFile.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          {!isUploading && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={removeFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Subiendo archivo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
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
                disabled={isUploading || isSubmittingAssignment}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || isUploading || isSubmittingAssignment}
              >
                {isUploading || isSubmittingAssignment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Entrega
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
