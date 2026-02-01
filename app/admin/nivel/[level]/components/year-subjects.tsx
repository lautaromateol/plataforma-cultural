"use client"

import React from "react"
import { YearSection } from "./year-section";
import { SubjectsTable } from "./subjects-table";
import {
  useGetSubjects,
} from "@/features/subject/api/use-get-subjects";
import { Year } from "@/features/year/schemas";
import { Subject } from "@/features/subject/api/use-get-subjects";
import { useOpenSubjectDialog } from "../hooks/use-open-subject-dialog"

export function YearSubjects({ year }: { year: Year }) {
  const { subjects, isPending, error } = useGetSubjects({ yearId: year.id });
  const { open } = useOpenSubjectDialog()

  const handleCreate = () => {
    open(year.id)
  };

  const handleEdit = (subject: Subject) => {
    open(year.id, subject)
  };

  return (
    <YearSection
      title="Materias"
      yearName={year.name}
      isPending={isPending}
      error={error}
    >
      <SubjectsTable 
        data={subjects ?? []} 
        onEdit={handleEdit}
        onCreate={handleCreate}
        yearId={year.id}
      />
    </YearSection>
  );
}
