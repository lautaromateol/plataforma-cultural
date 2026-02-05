import { TeacherCampusData } from "@/features/campus/api/use-get-campus";
import { SubjectTeacherCard } from "@/features/subject/components/subject-teacher-card";
import { GraduationCap } from "lucide-react";

type YearGroup = TeacherCampusData["teaching"][number];
type Subject = YearGroup["subjects"][number];

export function YearGroupSection({
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

  const colorClass = levelColors[yearGroup.level.order] || "from-slate-500 to-slate-600";

  return (
    <div className="space-y-4">
      {/* Year Header */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl bg-linear-to-br ${colorClass} shadow-lg`}
        >
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {yearGroup.level.studyPlan.name} · {yearGroup.level.name}
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
          <SubjectTeacherCard
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