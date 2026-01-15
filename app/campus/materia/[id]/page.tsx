"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useGetSubjectInfo } from "@/features/subject-resource/api/use-get-subject-info";
import { useGetSubjectTeachers } from "@/features/subject-resource/api/use-get-subject-teachers";
import { useGetSubjectCourses } from "@/features/subject-resource/api/use-get-subject-courses";
import { useGetResources } from "@/features/subject-resource/api/use-get-resources";
import { useDeleteResource } from "@/features/subject-resource/api/use-delete-resource";
import { Button } from "@/components/ui/button";
import { UploadResourceDialog } from "../components/upload-resource-dialog";
import { SubjectHeroHeader } from "@/app/campus/components/subject-hero-header";
import { TeachersCard } from "@/app/campus/components/teachers-card";
import { CoursesCard } from "@/app/campus/components/courses-card";
import { ResourcesSection } from "@/app/campus/components/resources-section";
import { ContentSections } from "@/app/campus/components/content-sections";
import { SubjectLoadingSkeleton } from "@/app/campus/components/subject-loading-skeleton";
import { getColorBySubjectId } from "@/lib/color-palettes";

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.id as string;
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: subjectData, isPending: isLoadingSubject, error: subjectError } =
    useGetSubjectInfo(subjectId);
  const { data: teachers = [], isPending: isLoadingTeachers } =
    useGetSubjectTeachers(subjectId);
  const { data: courses = [], isPending: isLoadingCourses } =
    useGetSubjectCourses(subjectId);
  const { resources, isPending: isLoadingResources } =
    useGetResources(subjectId);
  const { deleteResource, isDeletingResource } =
    useDeleteResource(subjectId);

  const isPending = isLoadingSubject || isLoadingTeachers || isLoadingCourses || isLoadingResources;
  const colors = getColorBySubjectId(subjectId);

  if (isPending) {
    return <SubjectLoadingSkeleton />;
  }

  if (!subjectData || subjectError) {
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
              {subjectError?.message || "No se pudo cargar la información de la materia"}
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

  const { subject, permissions } = subjectData;
  const resourcesList = resources || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header with Subject Info */}
      <SubjectHeroHeader
        subject={subject}
        courses={courses}
        teachers={teachers}
        colors={colors}
      />

      {/* Teachers and Courses Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeachersCard teachers={teachers} />
          <CoursesCard courses={courses} />
        </div>
      </div>

      {/* Main Content - Resources, Assignments and Quizzes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          {/* Resources Section */}
          <ResourcesSection
            resources={resourcesList}
            colors={colors}
            permissions={permissions}
            onUploadClick={() => setUploadDialogOpen(true)}
            onDeleteResource={deleteResource}
            isDeletingResource={isDeletingResource}
          />

          {/* Assignments and Quizzes */}
          <ContentSections
            subjectId={subjectId}
            colors={colors}
            permissions={permissions}
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadResourceDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        subjectId={subjectId}
      />
    </div>
  );
}
