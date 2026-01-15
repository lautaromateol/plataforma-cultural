import { YearSection } from "./year-section";
import { SubjectsTable } from "./subjects-table";
import {
  useGetSubjects,
} from "@/features/subject/api/use-get-subjects";
import { Year } from "@/features/year/schemas";

export function YearSubjects({ year }: { year: Year }) {
  const { subjects, isPending, error } = useGetSubjects({ yearId: year.id });

  return (
    <YearSection
      title="Materias"
      yearName={year.name}
      isPending={isPending}
      error={error}
    >
      <SubjectsTable data={subjects ?? []} />
    </YearSection>
  );
}
