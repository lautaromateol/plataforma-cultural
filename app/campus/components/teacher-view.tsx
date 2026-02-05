"use client";

import { TeacherCampusData } from "@/features/campus/api/use-get-campus";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Layers,
  Target,
} from "lucide-react";
import { useState } from "react";
import { TeacherWelcomeSection } from "./teacher-welcome-section";
import { TeacherStatsCard } from "./teacher-stats-card";
import { YearGroupSection } from "./year-group-section";

interface TeacherViewProps {
  data: TeacherCampusData;
}

export function TeacherView({ data }: TeacherViewProps) {
  const { user, teaching, stats } = data;
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <TeacherWelcomeSection name={user.name} stats={stats} />
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <TeacherStatsCard
            title="Materias Asignadas"
            value={stats.totalSubjects}
            description="materias en total"
            icon={BookOpen}
            color="blue"
          />
          <TeacherStatsCard
            title="Cursos"
            value={stats.totalCourses}
            description="grupos diferentes"
            icon={Layers}
            color="emerald"
          />
          <TeacherStatsCard
            title="Estudiantes"
            value={stats.totalStudents}
            description="alumnos en total"
            icon={Users}
            color="purple"
          />
        </div>
      </div>

      {/* Teaching by Year */}
      {teaching.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <BookOpen className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-amber-900">
                  Sin materias asignadas
                </h3>
                <p className="text-amber-700 mt-2 max-w-md mx-auto">
                  Actualmente no tienes materias asignadas. Contacta con la
                  administración para más información.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Target className="size-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Mis Asignaturas
              </h2>
              <p className="text-muted-foreground">
                Organizado por año escolar
              </p>
            </div>
          </div>

          <div className="space-y-6 p-4 bg-white/70 backdrop-blur">
            {teaching.map((yearGroup) => (
              <YearGroupSection
                key={yearGroup.level.id}
                yearGroup={yearGroup}
                expandedSubject={expandedSubject}
                setExpandedSubject={setExpandedSubject}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

