import { YearSection } from "./year-section";
import { TeachersTable } from "./teachers-table";
import { useGetTeachers } from "@/features/user/api/use-get-teachers";
import { Level } from "@/features/level/schemas";

export function LevelTeachers({ level }: { level: Level }) {
  const { teachers, isPending, error } = useGetTeachers({ levelId: level.id });

  return (
    <YearSection
      title="Profesores"
      yearName={level.name}
      isPending={isPending}
      error={error}
    >
      <TeachersTable data={teachers ?? []} />
    </YearSection>
  );
}
