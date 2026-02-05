import { ChevronRight, GraduationCap, MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherCampusData } from "@/features/campus/api/use-get-campus";
import { cn } from "@/lib/utils";

type YearGroup = TeacherCampusData["teaching"][number];
type Subject = YearGroup["subjects"][number];
type Course = Subject["courses"][number];

export function SubjectTeacherCard({
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
      <div className={`h-1.5 bg-linear-to-r ${colorClass}`} />

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
                "w-5 h-5 text-muted-foreground transition-transform shrink-0",
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