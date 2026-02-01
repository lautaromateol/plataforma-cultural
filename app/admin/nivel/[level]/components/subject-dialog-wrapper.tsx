"use client"

import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { useOpenSubjectDialog } from "../hooks/use-open-subject-dialog"
import { SubjectForm } from "./subject-dialog"

export function SubjectDialogWrapper() {
  const { isOpen, close } = useOpenSubjectDialog()

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <SubjectForm />
    </ResponsiveModal>
  )
}
