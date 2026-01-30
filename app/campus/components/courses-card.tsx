"use client";

import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock, GraduationCap } from "lucide-react";
import { useGetSubjectCourses } from "@/features/subject-resource/api/use-get-subject-courses";
import { Skeleton } from "@/components/ui/skeleton";

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

interface CoursesCardProps {
  subjectId: string;
}

export function CoursesCard({ subjectId }: CoursesCardProps) {
  const { data: courses = [], isPending: isLoadingCourses } = useGetSubjectCourses(subjectId);

  if (courses.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-80">
      <div className="px-6 py-5 border-b border-slate-200 shrink-0 bg-linear-to-r from-emerald-50 to-emerald-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-200">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Cursos</h2>
        </div>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {isLoadingCourses ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </>
        ) : (
          <>
            {courses.map((course: Course) => (
              <div
                key={course.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-all border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{course.name}</h4>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 font-medium">
                    {course.studentsCount} alumnos
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  {course.classroom && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {course.classroom}
                    </p>
                  )}
                  {course.schedule && (
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {course.schedule}
                    </p>
                  )}
                  {course.teacher && (
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                      {course.teacher.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
