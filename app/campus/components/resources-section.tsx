"use client";

import { Button } from "@/components/ui/button";
import { Download, Trash2, Calendar, GraduationCap, Sparkles, Upload, Folder } from "lucide-react";
import { formatFileSize, getFileIcon, getFileColor } from "@/lib/file-utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string | null;
  };
};

interface ResourcesSectionProps {
  resources: Resource[];
  colors: {
    bg: string;
    light: string;
    text: string;
    border: string;
  };
  permissions: {
    canEdit: boolean;
  };
  onUploadClick: () => void;
  onDeleteResource: (resourceId: string) => void;
  isDeletingResource: boolean;
}

export function ResourcesSection({
  resources,
  colors,
  permissions,
  onUploadClick,
  onDeleteResource,
  isDeletingResource,
}: ResourcesSectionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const handleDeleteClick = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (resourceToDelete) {
      onDeleteResource(resourceToDelete);
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Resources Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colors.light}`}>
              <Folder className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recursos</h2>
              <p className="text-sm text-slate-500">
                {resources.length} {resources.length === 1 ? "archivo disponible" : "archivos disponibles"}
              </p>
            </div>
          </div>
          {permissions.canEdit && (
            <Button
              onClick={onUploadClick}
              className={`bg-gradient-to-r ${colors.bg} hover:opacity-90 shadow-lg shadow-slate-200`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Recurso
            </Button>
          )}
        </div>

        {/* Resources List */}
        <div className="p-6">
          {resources.length === 0 ? (
            <div className="text-center py-16">
              <div className={`w-20 h-20 rounded-3xl ${colors.light} flex items-center justify-center mx-auto mb-5`}>
                <Sparkles className={`w-10 h-10 ${colors.text}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay recursos aún
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {permissions.canEdit
                  ? "Sube tu primer recurso para que los alumnos puedan descargarlo"
                  : "Los profesores aún no han subido recursos para esta materia"}
              </p>
              {permissions.canEdit && (
                <Button
                  onClick={onUploadClick}
                  className={`mt-6 bg-gradient-to-r ${colors.bg} hover:opacity-90`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir primer recurso
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {resources.map((resource: Resource) => (
                <div
                  key={resource.id}
                  className="group relative flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300"
                >
                  {/* File Icon */}
                  <div
                    className={`shrink-0 p-3.5 rounded-2xl bg-gradient-to-br ${getFileColor(resource.fileType)} text-white shadow-lg`}
                  >
                    {getFileIcon(resource.fileType)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-800">
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="font-medium bg-slate-100 px-2 py-1 rounded-full">
                        {formatFileSize(resource.fileSize)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(resource.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {resource.uploadedBy.name}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={resource.fileUrl}
                      download={resource.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className={`bg-gradient-to-r ${colors.bg} hover:opacity-90 shadow-md`}
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Descargar
                      </Button>
                    </a>
                    {permissions.canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(resource.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingResource}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isDeletingResource ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
