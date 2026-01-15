import { YearSection } from "./year-section";
import { TeachersTable } from "./teachers-table";
import { useGetTeachers } from "@/features/user/api/use-get-teachers";
import { Year } from "@/features/year/schemas";

export function YearTeachers({ year }: { year: Year }) {
  const { teachers, isPending, error } = useGetTeachers({ yearId: year.id });

  return (
    <YearSection
      title="Profesores"
      yearName={year.name}
      isPending={isPending}
      error={error}
    >
      <TeachersTable data={teachers ?? []} />
    </YearSection>
  );
}
