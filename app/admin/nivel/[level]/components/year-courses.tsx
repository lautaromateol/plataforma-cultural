"use client"

import React from "react"
import { YearSection } from "./year-section";
import { CoursesTable } from "./courses-table";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { Year } from "@/features/year/schemas";
import { Course } from "@/features/course/api/use-get-courses";
import { useOpenCourseDialog } from "../hooks/use-open-course-dialog"

export function YearCourses({ year }: { year: Year }) {
  const { courses, isPending, error } = useGetCourses({ yearId: year.id });
  const { open } = useOpenCourseDialog()

  const handleCreate = () => {
    open(year.id)
  };

  const handleEdit = (course: Course) => {
    open(year.id, course)
  };

  return (
    <YearSection
      title="Cursos"
      yearName={year.name}
      isPending={isPending}
      error={error}
    >
      <CoursesTable 
        data={courses ?? []} 
        onEdit={handleEdit}
        onCreate={handleCreate}
        yearId={year.id}
      />
    </YearSection>
  );
}
