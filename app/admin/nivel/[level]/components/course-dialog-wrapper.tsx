"use client"

import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { useOpenCourseDialog } from "../hooks/use-open-course-dialog"
import { CourseForm } from "./course-dialog"

export function CourseDialogWrapper() {
  const { isOpen, close } = useOpenCourseDialog()

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <CourseForm />
    </ResponsiveModal>
  )
}
