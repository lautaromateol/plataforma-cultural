"use client";

import { StudentCampusData } from "@/features/campus/api/use-get-campus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  Users,
  Clock,
  User,
  Mail,
  Sparkles,
} from "lucide-react";

interface StudentViewProps {
  data: StudentCampusData;
}

export function StudentView({ data }: StudentViewProps) {
  const { user, enrollment } = data;

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <WelcomeSection name={user.name} />
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
        <WelcomeSection
          name={user.name}
          levelName={enrollment.level.name}
          studyPlanName={enrollment.level.studyPlan.name}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
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
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
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
            <SubjectCard key={subject.id} subject={subject} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeSection({
  name,
  levelName,
  studyPlanName,
}: {
  name: string;
  levelName?: string;
  studyPlanName?: string;
}) {
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl shadow-blue-500/25">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/2" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-blue-200 text-sm font-medium">{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            ¡Hola, {firstName}!
          </h1>
          {(levelName || studyPlanName) && (
            <p className="text-blue-100 text-lg">
              {studyPlanName && <span className="font-semibold">{studyPlanName}</span>}
              {studyPlanName && levelName && " · "}
              {levelName && <span className="font-semibold">{levelName}</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-right">
            <p className="text-blue-200 text-xs uppercase tracking-wider">
              Fecha actual
            </p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectCard({
  subject,
  index,
}: {
  subject: StudentCampusData["enrollment"] extends infer T
  ? T extends { subjects: infer S }
  ? S extends Array<infer U>
  ? U
  : never
  : never
  : never;
  index: number;
}) {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-indigo-500 to-indigo-600",
    "from-pink-500 to-pink-600",
  ];

  const colorClass = colors[index % colors.length];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <a href={`/campus/materia/${subject.id}`}>
      <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Top color bar */}
        <div className={`h-2 bg-gradient-to-r ${colorClass}`} />

        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h3>
              {subject.code && (
                <Badge variant="secondary" className="mt-1 font-mono text-xs">
                  {subject.code}
                </Badge>
              )}
            </div>
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>

          {subject.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {subject.description}
            </p>
          )}

          <div className="pt-3 border-t space-y-2">
            {subject.teacher ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border border-slate-200">
                  <AvatarFallback className="text-xs bg-slate-100">
                    {getInitials(subject.teacher.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {subject.teacher.name}
                  </p>
                  {subject.teacher.email && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {subject.teacher.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="text-sm">Sin profesor asignado</span>
              </div>
            )}

            {subject.schedule && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{subject.schedule}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

