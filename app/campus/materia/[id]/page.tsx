"use client";

import { useParams } from "next/navigation";
import { useGetSubjectInfo } from "@/features/subject-resource/api/use-get-subject-info";
import { useGetResources } from "@/features/subject-resource/api/use-get-resources";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ArrowLeft,
  Users,
  GraduationCap,
  Mail,
  Clock,
  MapPin,
  Upload,
  FileText,
  Download,
  Calendar,
  Trash2,
  Sparkles,
  FileVideo,
  FileImage,
  FileMusic,
  FileArchive,
  File,
  Folder,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UploadResourceDialog } from "../components/upload-resource-dialog";
import { useDeleteResource } from "@/features/subject-resource/api/use-delete-resource";
import { QuizList } from "@/features/quiz/components/quiz-list";
import { AssignmentList } from "@/features/assignment/components/assignment-list";
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

// Types
type Teacher = {
  id: string;
  name: string;
  email: string | null;
};

type Course = {
  id: string;
  courseSubjectId?: string;
  name: string;
  classroom: string | null;
  schedule: string | null;
  studentsCount: number;
  teacher: Teacher | null;
};

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

// Color palettes for subjects
const colorPalettes = [
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  { bg: "from-blue-500 to-cyan-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  { bg: "from-fuchsia-500 to-pink-600", light: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200" },
];

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.id as string;
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const { data: subjectData, isPending: isLoadingSubject } =
    useGetSubjectInfo(subjectId);
  const { resources, isPending: isLoadingResources } =
    useGetResources(subjectId);
  const { deleteResource, isDeletingResource } =
    useDeleteResource(subjectId);

  const isPending = isLoadingSubject || isLoadingResources;

  // Generate consistent color based on subject ID
  const colorIndex = subjectId ? subjectId.charCodeAt(0) % colorPalettes.length : 0;
  const colors = colorPalettes[colorIndex];

  if (isPending) {
    return <SubjectLoadingSkeleton />;
  }

  if (!subjectData || "message" in subjectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center mx-auto shadow-lg">
            <BookOpen className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Error al cargar
            </h2>
            <p className="text-slate-600">
              {"message" in subjectData
                ? subjectData.message
                : "No se pudo cargar la información de la materia"}
            </p>
          </div>
          <Link href="/campus">
            <Button className="bg-slate-900 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Campus
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { subject, teachers, courses, permissions } = subjectData;
  const resourcesList = resources || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="w-6 h-6" />;
    if (fileType.includes("image")) return <FileImage className="w-6 h-6" />;
    if (fileType.includes("video")) return <FileVideo className="w-6 h-6" />;
    if (fileType.includes("audio")) return <FileMusic className="w-6 h-6" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getFileColor = (fileType: string) => {
    if (fileType.includes("pdf")) return "from-red-500 to-rose-600";
    if (fileType.includes("image")) return "from-emerald-500 to-teal-600";
    if (fileType.includes("video")) return "from-violet-500 to-purple-600";
    if (fileType.includes("audio")) return "from-amber-500 to-orange-600";
    if (fileType.includes("word") || fileType.includes("document")) return "from-blue-500 to-cyan-600";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "from-green-500 to-emerald-600";
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "from-orange-500 to-red-600";
    if (fileType.includes("zip") || fileType.includes("rar")) return "from-slate-500 to-gray-600";
    return "from-slate-400 to-gray-500";
  };

  const handleDeleteClick = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (resourceToDelete) {
      deleteResource(resourceToDelete);
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  const totalStudents = courses.reduce((acc: number, course: Course) => acc + course.studentsCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${colors.bg}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white blur-2xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link href="/campus">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Campus
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-4">
              {/* Icon & Title */}
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    {subject.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {subject.code && (
                      <Badge className="bg-white/20 text-white border-0 font-mono text-sm backdrop-blur-sm">
                        {subject.code}
                      </Badge>
                    )}
                    <span className="text-white/80 text-sm font-medium">
                      {subject.year.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {subject.description && (
                <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                  {subject.description}
                </p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{teachers.length}</p>
                <p className="text-white/80 text-sm">Profesores</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{courses.length}</p>
                <p className="text-white/80 text-sm">Cursos</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{totalStudents}</p>
                <p className="text-white/80 text-sm">Alumnos</p>
              </div>
            </div>
          </div>

          {/* Teachers & Courses Cards in Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Teachers Card */}
            {teachers.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden flex flex-col h-80">
                <div className="px-6 py-5 border-b border-white/20 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/20">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      Profesores
                    </h2>
                  </div>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {teachers.map((teacher: Teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-white/30 shadow-md">
                        <AvatarFallback className="bg-white/20 text-white font-semibold">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{teacher.name}</p>
                        {teacher.email && (
                          <p className="text-sm text-white/80 truncate flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {teacher.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Card */}
            {courses.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden flex flex-col h-80">
                <div className="px-6 py-5 border-b border-white/20 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/20">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      Cursos
                    </h2>
                  </div>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {courses.map((course: Course) => (
                    <div
                      key={course.id}
                      className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">
                          {course.name}
                        </h4>
                        <Badge className="bg-white/20 text-white border-0 font-medium">
                          {course.studentsCount} alumnos
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-sm text-white/80">
                        {course.classroom && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-white/60" />
                            {course.classroom}
                          </p>
                        )}
                        {course.schedule && (
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white/60" />
                            {course.schedule}
                          </p>
                        )}
                        {course.teacher && (
                          <p className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-white/60" />
                            {course.teacher.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Resources, Assignments and Quizzes (Full Width) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
            {/* Resources Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Resources Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${colors.light}`}>
                    <Folder className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Recursos
                    </h2>
                    <p className="text-sm text-slate-500">
                      {resourcesList.length} {resourcesList.length === 1 ? 'archivo disponible' : 'archivos disponibles'}
                    </p>
                  </div>
                </div>
                {permissions.canEdit && (
                  <Button 
                    onClick={() => setUploadDialogOpen(true)}
                    className={`bg-gradient-to-r ${colors.bg} hover:opacity-90 shadow-lg shadow-slate-200`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Recurso
                  </Button>
                )}
              </div>

              {/* Resources List */}
              <div className="p-6">
                {resourcesList.length === 0 ? (
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
                        : "Los profesores aún no han subido recursos para esta materia"
                      }
                    </p>
                    {permissions.canEdit && (
                      <Button 
                        onClick={() => setUploadDialogOpen(true)}
                        className={`mt-6 bg-gradient-to-r ${colors.bg} hover:opacity-90`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Subir primer recurso
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {resourcesList.map((resource: Resource) => (
                      <div
                        key={resource.id}
                        className="group relative flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300"
                      >
                        {/* File Icon */}
                        <div className={`flex-shrink-0 p-3.5 rounded-2xl bg-gradient-to-br ${getFileColor(resource.fileType)} text-white shadow-lg`}>
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
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
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

            {/* Assignments Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${colors.light}`}>
                    <Upload className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Entregas
                    </h2>
                    <p className="text-sm text-slate-500">
                      {permissions.canEdit
                        ? "Gestiona las entregas de los estudiantes"
                        : "Sube tus trabajos y revisa tus calificaciones"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AssignmentList subjectId={subjectId} />
              </div>
            </div>

            {/* Quizzes Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${colors.light}`}>
                    <FileText className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Cuestionarios
                    </h2>
                    <p className="text-sm text-slate-500">
                      Realiza cuestionarios y evalúa tu conocimiento
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <QuizList subjectId={subjectId} />
              </div>
            </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadResourceDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        subjectId={subjectId}
      />

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
    </div>
  );
}

function SubjectLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-r from-slate-300 to-slate-400 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6 bg-white/20" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-80 bg-white/20" />
                  <Skeleton className="h-6 w-40 bg-white/20" />
                </div>
              </div>
              <Skeleton className="h-20 w-[500px] bg-white/20" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-24 w-28 rounded-2xl bg-white/20" />
              <Skeleton className="h-24 w-28 rounded-2xl bg-white/20" />
              <Skeleton className="h-24 w-28 rounded-2xl bg-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Skeleton className="h-64 rounded-3xl bg-white/20" />
            <Skeleton className="h-64 rounded-3xl bg-white/20" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
