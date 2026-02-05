"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGetSubjectInfo } from "@/features/subject-resource/api/use-get-subject-info";
import { useGetSubjectTeachers } from "@/features/subject-resource/api/use-get-subject-teachers";
import { useGetSubjectCourses } from "@/features/subject-resource/api/use-get-subject-courses";
import { Skeleton } from "@/components/ui/skeleton";

interface SubjectHeroHeaderProps {
  subjectId: string;
  colors: {
    bg: string;
    light: string;
    text: string;
    border: string;
  };
}

export function SubjectHeroHeader({
  subjectId,
  colors,
}: SubjectHeroHeaderProps) {
  const { data: subjectData } = useGetSubjectInfo(subjectId);
  const { data: teachers = [] } = useGetSubjectTeachers(subjectId);
  const { data: courses = [] } = useGetSubjectCourses(subjectId);

  const subject = subjectData?.subject;
  const totalStudents = courses.reduce((acc, course) => acc + course.studentsCount, 0);

  return (
    <div className={`relative overflow-hidden bg-linear-to-r ${colors.bg}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-white blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
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
                {subject ? (
                  <>
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
                        {subject.level.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-10 w-64 bg-white/20 mb-2" />
                    <Skeleton className="h-6 w-40 bg-white/20" />
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {subject?.description && (
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
      </div>
    </div>
  );
}
