"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmitAssignment } from "../api/use-submit-assignment";
import {
  Upload,
  Loader2,
  X,
  FileText,
  CheckCircle2,
  Cloud,
  FileImage,
  FileVideo,
  FileMusic,
  FileArchive,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [isDragging, setIsDragging] = useState(false);

  const { submitAssignmentAsync, isSubmittingAssignment } = useSubmitAssignment();

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="w-8 h-8" />;
    if (fileType.includes("image")) return <FileImage className="w-8 h-8" />;
    if (fileType.includes("video")) return <FileVideo className="w-8 h-8" />;
    if (fileType.includes("audio")) return <FileMusic className="w-8 h-8" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const getFileColor = (fileType: string) => {
    if (fileType.includes("pdf")) return "from-red-500 to-rose-600";
    if (fileType.includes("image")) return "from-emerald-500 to-teal-600";
    if (fileType.includes("video")) return "from-violet-500 to-purple-600";
    if (fileType.includes("audio")) return "from-amber-500 to-orange-600";
    if (fileType.includes("word") || fileType.includes("document")) return "from-blue-500 to-cyan-600";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "from-green-500 to-emerald-600";
    if (fileType.includes("zip") || fileType.includes("rar")) return "from-slate-500 to-gray-600";
    return "from-slate-400 to-gray-500";
  };

  const handleFileSelect = useCallback((file: File) => {
    // Validar tamaño del archivo (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 50MB");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      // Subir el archivo al servidor (que lo sube a Vercel Blob)
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("Error from upload endpoint:", errorData);
        throw new Error(errorData.error || "Error al subir el archivo");
      }

      const { fileUrl, fileType, fileSize } = await uploadResponse.json();
      setUploadProgress(100);

      // Crear la entrega en la base de datos
      await submitAssignmentAsync({
        assignmentId,
        fileName: selectedFile.name,
        fileUrl: fileUrl,
        fileType: fileType || selectedFile.type,
        fileSize: fileSize || selectedFile.size,
      });

      setSelectedFile(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir la entrega"
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || isSubmittingAssignment;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isLoading) {
          onOpenChange(newOpen);
          if (!newOpen) {
            setSelectedFile(null);
            setUploadProgress(0);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-[540px] rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">Entregar Tarea</DialogTitle>
              <DialogDescription className="mt-0.5">
                Sube tu archivo de forma segura
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* File Drop Zone */}
          <div className="space-y-3">
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                        className={cn(
                    "relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer",
                    isDragging
                      ? "border-blue-500 bg-blue-50 scale-[1.02]"
                      : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                  )}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="*/*"
                    disabled={isLoading}
                  />
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-colors",
                        isDragging ? "bg-blue-100" : "bg-slate-100"
                      )}
                    >
                      <Upload
                        className={cn(
                          "w-8 h-8 transition-colors",
                          isDragging ? "text-blue-500" : "text-slate-400"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">
                        Arrastra un archivo aquí
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        o <span className="text-blue-600 font-medium">selecciona</span> uno de tu dispositivo
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 rounded-full">PDF</span>
                      <span className="px-2 py-1 bg-slate-100 rounded-full">DOC</span>
                      <span className="px-2 py-1 bg-slate-100 rounded-full">+</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Máximo 50MB
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "relative p-5 border rounded-2xl transition-all",
                    uploadProgress === 100
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 p-3 rounded-xl text-white shadow-lg bg-gradient-to-br",
                        getFileColor(selectedFile.type)
                      )}
                    >
                      {getFileIcon(selectedFile.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      {isLoading && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadProgress === 100 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        disabled={isLoading}
                        className="rounded-full hover:bg-slate-200"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress < 100 ? "Subiendo..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Entregar Tarea
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
