"use client";

import { TeacherCampusData } from "@/features/campus/api/use-get-campus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  GraduationCap,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  Target,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Tipos auxiliares para mejorar la inferencia
type YearGroup = TeacherCampusData["teaching"][number];
type Subject = YearGroup["subjects"][number];
type Course = Subject["courses"][number];

interface TeacherViewProps {
  data: TeacherCampusData;
}

export function TeacherView({ data }: TeacherViewProps) {
  const { user, teaching, stats } = data;
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <WelcomeSection name={user.name} stats={stats} />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Materias Asignadas"
          value={stats.totalSubjects}
          description="materias en total"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Cursos"
          value={stats.totalCourses}
          description="grupos diferentes"
          icon={Layers}
          color="emerald"
        />
        <StatsCard
          title="Estudiantes"
          value={stats.totalStudents}
          description="alumnos en total"
          icon={Users}
          color="purple"
        />
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Mis Asignaturas
              </h2>
              <p className="text-sm text-muted-foreground">
                Organizado por año escolar
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {teaching.map((yearGroup) => (
              <YearGroupSection
                key={yearGroup.year.id}
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

function WelcomeSection({
  name,
  stats,
}: {
  name: string;
  stats: TeacherCampusData["stats"];
}) {
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl shadow-emerald-500/25">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/2" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-emerald-200 text-sm font-medium">
              {greeting}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            ¡Hola, Prof. {firstName}!
          </h1>
          <p className="text-emerald-100 text-lg">
            Tienes{" "}
            <span className="font-semibold">{stats.totalStudents} estudiantes</span>{" "}
            esperando por ti
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-right">
            <p className="text-emerald-200 text-xs uppercase tracking-wider">
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

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: "blue" | "emerald" | "purple";
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      gradient: "from-emerald-500/10 to-teal-500/10",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      gradient: "from-purple-500/10 to-pink-500/10",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-xl ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function YearGroupSection({
  yearGroup,
  expandedSubject,
  setExpandedSubject,
}: {
  yearGroup: YearGroup;
  expandedSubject: string | null;
  setExpandedSubject: (id: string | null) => void;
}) {
  const levelColors: Record<number, string> = {
    1: "from-blue-500 to-blue-600",
    2: "from-emerald-500 to-emerald-600",
    3: "from-purple-500 to-purple-600",
    4: "from-rose-500 to-rose-600",
    5: "from-amber-500 to-amber-600",
    6: "from-cyan-500 to-cyan-600",
  };

  const colorClass = levelColors[yearGroup.year.level] || "from-slate-500 to-slate-600";

  return (
    <div className="space-y-4">
      {/* Year Header */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl bg-gradient-to-br ${colorClass} shadow-lg`}
        >
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {yearGroup.year.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {yearGroup.subjects.length} materia
            {yearGroup.subjects.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {yearGroup.subjects.map((subject: Subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isExpanded={expandedSubject === subject.id}
            onToggle={() =>
              setExpandedSubject(
                expandedSubject === subject.id ? null : subject.id
              )
            }
            colorClass={colorClass}
          />
        ))}
      </div>
    </div>
  );
}

function SubjectCard({
  subject,
  isExpanded,
  onToggle,
  colorClass,
}: {
  subject: Subject;
  isExpanded: boolean;
  onToggle: () => void;
  colorClass: string;
}) {
  const totalStudents = subject.courses.reduce(
    (sum: number, course: Course) => sum + course.studentsCount,
    0
  );

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 bg-white/70 backdrop-blur transition-all duration-300",
        isExpanded ? "shadow-xl ring-2 ring-blue-500/20" : "hover:shadow-lg"
      )}
    >
      {/* Top color bar */}
      <div className={`h-1.5 bg-gradient-to-r ${colorClass}`} />

      <CardContent className="p-5">
        <div className="space-y-4">
          <div
            className="flex items-start justify-between gap-3 cursor-pointer"
            onClick={onToggle}
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {subject.code && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {subject.code}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {subject.courses.length} curso
                  {subject.courses.length !== 1 ? "s" : ""} • {totalStudents}{" "}
                  estudiante{totalStudents !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                isExpanded && "rotate-90"
              )}
            />
          </div>

          {/* Ver Materia Button */}
          <a href={`/campus/materia/${subject.id}`} className="block">
            <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Ver página de materia
            </button>
          </a>

          {/* Expanded Content */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded ? "max-h-96" : "max-h-0"
            )}
          >
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium text-slate-700">Cursos:</p>
              {subject.courses.map((course: Course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{course.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {course.classroom && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {course.classroom}
                          </span>
                        )}
                        {course.schedule && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.schedule}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-900">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {course.studentsCount}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      estudiantes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

