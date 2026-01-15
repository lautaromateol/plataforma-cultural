import { YearSection } from "./year-section";
import { CoursesTable } from "./courses-table";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { Year } from "@/features/year/schemas";

export function YearCourses({ year }: { year: Year }) {
  const { courses, isPending, error } = useGetCourses({ yearId: year.id });
  return (
    <YearSection
      title="Cursos"
      yearName={year.name}
      isPending={isPending}
      error={error}
    >
      <CoursesTable data={courses ?? []} />
    </YearSection>
  );
}
