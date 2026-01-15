import { YearSection } from "./year-section";
import { StudentsTable } from "./students-table";
import { useGetStudents } from "@/features/user/api/use-get-students";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { Year } from "@/features/year/schemas";

export function YearStudents({ year }: { year: Year }) {
  const { courses } = useGetCourses({ yearId: year.id });
  const { students, isPending, error } = useGetStudents({ yearId: year.id });

  return (
    <YearSection
      title="Estudiantes"
      yearName={year.name}
      isPending={isPending}
      error={error}
    >
      <StudentsTable
        data={students ?? []}
        courses={courses ?? []}
        yearId={year.id}
      />
    </YearSection>
  );
}
