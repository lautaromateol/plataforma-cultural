"use client";

import { StudentCampusData } from "@/features/campus/api/use-get-campus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import { SubjectStudentCard } from "@/features/subject/components/subject-student-card";
import { StudentWelcomeSection } from "./student-welcome-section";

interface StudentViewProps {
  data: StudentCampusData;
}

export function StudentView({ data }: StudentViewProps) {
  const { user, enrollment } = data;

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <StudentWelcomeSection name={user.name} />
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <GraduationCap className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-amber-900">
                  Sin matrícula activa
                </h3>
                <p className="text-amber-700 mt-2 max-w-md mx-auto">
                  Actualmente no estás matriculado en ningún curso. Contacta con
                  la administración para más información.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <StudentWelcomeSection
          name={user.name}
          levelName={enrollment.level.name}
          studyPlanName={enrollment.level.studyPlan.name}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nivel
              </CardTitle>
              <div className="p-2 rounded-xl bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {enrollment.level.name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {enrollment.level.studyPlan.name}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Curso
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-100">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {enrollment.course.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {enrollment.course.classroom && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {enrollment.course.classroom}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compañeros
              </CardTitle>
              <div className="p-2 rounded-xl bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {enrollment.course.studentsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {enrollment.course.capacity} lugares
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-linear-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (enrollment.course.studentsCount / enrollment.course.capacity) *
                      100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <BookOpen className="size-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mis Materias</h2>
            <p className="text-muted-foreground">
              {enrollment.subjects.length} materias asignadas
            </p>
          </div>
        </div>

        <div className="p-4 bg-white/70 backdrop-blur grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollment.subjects.map((subject, index) => (
            <SubjectStudentCard key={subject.id} subject={subject} index={index} />
          ))}
        </div>
      </div>
    </div>
  )};