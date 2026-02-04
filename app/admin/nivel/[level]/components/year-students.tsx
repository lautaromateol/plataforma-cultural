import { YearSection } from "./year-section";
import { StudentsTable } from "./students-table";
import { useGetStudents } from "@/features/user/api/use-get-students";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { Level } from "@/features/level/schemas";

export function LevelStudents({ level }: { level: Level }) {
  const { courses } = useGetCourses({ levelId: level.id });
  const { students, isPending, error } = useGetStudents({ levelId: level.id });

  return (
    <YearSection
      title="Estudiantes"
      yearName={level.name}
      isPending={isPending}
      error={error}
    >
      <StudentsTable
        data={students ?? []}
        courses={courses ?? []}
        levelId={level.id}
      />
    </YearSection>
  );
}
