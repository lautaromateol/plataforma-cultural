"use client"

import React from "react"
import { YearSection } from "./year-section";
import { CoursesTable } from "./courses-table";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { Level } from "@/features/level/schemas";
import { Course } from "@/features/course/api/use-get-courses";
import { useOpenCourseDialog } from "../hooks/use-open-course-dialog"

export function LevelCourses({ level }: { level: Level }) {
  const { courses, isPending, error } = useGetCourses({ levelId: level.id });
  const { open } = useOpenCourseDialog()

  const handleCreate = () => {
    open(level.id)
  };

  const handleEdit = (course: Course) => {
    open(level.id, course)
  };

  return (
    <YearSection
      title="Cursos"
      yearName={level.name}
      isPending={isPending}
      error={error}
    >
      <CoursesTable
        data={courses ?? []}
        onEdit={handleEdit}
        onCreate={handleCreate}
        levelId={level.id}
      />
    </YearSection>
  );
}
