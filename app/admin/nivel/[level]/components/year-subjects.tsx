"use client"

import React from "react"
import { YearSection } from "./year-section";
import { SubjectsTable } from "./subjects-table";
import {
  useGetSubjects,
} from "@/features/subject/api/use-get-subjects";
import { Level } from "@/features/level/schemas";
import { Subject } from "@/features/subject/api/use-get-subjects";
import { useOpenSubjectDialog } from "../hooks/use-open-subject-dialog"

export function LevelSubjects({ level }: { level: Level }) {
  const { subjects, isPending, error } = useGetSubjects({ levelId: level.id });
  const { open } = useOpenSubjectDialog()

  const handleCreate = () => {
    open(level.id)
  };

  const handleEdit = (subject: Subject) => {
    open(level.id, subject)
  };

  return (
    <YearSection
      title="Materias"
      yearName={level.name}
      isPending={isPending}
      error={error}
    >
      <SubjectsTable
        data={subjects ?? []}
        onEdit={handleEdit}
        onCreate={handleCreate}
        levelId={level.id}
      />
    </YearSection>
  );
}
