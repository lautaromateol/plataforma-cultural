"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useGetSubjectInfo } from "@/features/subject-resource/api/use-get-subject-info";
import { Button } from "@/components/ui/button";
import { SubjectHeroHeader } from "@/app/campus/components/subject-hero-header";
import { TeachersCard } from "@/app/campus/components/teachers-card";
import { CoursesCard } from "@/app/campus/components/courses-card";
import { ResourcesSection } from "@/app/campus/components/resources-section";
import { SubjectLoadingSkeleton } from "@/app/campus/components/subject-loading-skeleton";
import { getColorBySubjectId } from "@/lib/color-palettes";
import { AnnouncementsSection } from "@/features/announcement/components/announcements-section";
import { AssignmentsSection } from "@/features/assignment/components/assignments-section";
import { QuizzesSection } from "@/features/quiz/components/quizzes-section";

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.id as string;

  const { data: subjectData, isPending: isLoadingSubject, error: subjectError } =
    useGetSubjectInfo(subjectId);

  const isPending = isLoadingSubject;
  const colors = getColorBySubjectId(subjectId);

  if (isPending) {
    return <SubjectLoadingSkeleton />;
  }

  if (!subjectData || subjectError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-red-100 to-rose-200 flex items-center justify-center mx-auto shadow-lg">
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

  return (
    <div className="min-h-screen">
      <SubjectHeroHeader subjectId={subjectId} colors={colors} />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeachersCard subjectId={subjectId} />
          <CoursesCard subjectId={subjectId} />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <AnnouncementsSection subjectId={subjectId} colors={colors} />
          <ResourcesSection subjectId={subjectId} colors={colors} />
          <AssignmentsSection subjectId={subjectId} colors={colors} />
          <QuizzesSection subjectId={subjectId} colors={colors} />
        </div>
      </div>
    </div>
  );
}
