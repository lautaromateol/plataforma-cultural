import { BookOpen, Clock, Mail, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StudentCampusData } from "@/features/campus/api/use-get-campus";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SubjectStudentCard({
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
        <div className={`h-2 bg-linear-to-r ${colorClass}`} />

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
              className={`shrink-0 w-10 h-10 rounded-xl bg-linear-to-br ${colorClass} flex items-center justify-center shadow-lg`}
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