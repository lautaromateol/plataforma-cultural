"use client"

import * as React from "react"
import { useState } from "react"
import { StudyPlanTable } from "./study-plan-table"
import { StudyPlanForm } from "./study-plan-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { StudyPlan } from "../api/use-get-study-plans"

export function StudyPlanCRUDPanel() {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [toEdit, setToEdit] = useState<StudyPlan | null>(null)

  const openAdd = () => {
    setMode("add")
    setToEdit(null)
  }

  const openEdit = (studyPlan: StudyPlan) => {
    setMode("edit")
    setToEdit(studyPlan)
  }

  const handleDone = () => {
    setMode("list")
    setToEdit(null)
  }

  return (
    <div className="space-y-6">
      {mode === "list" ? (
        <StudyPlanTable onEdit={openEdit} onCreate={openAdd} />
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleDone} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
          <StudyPlanForm
            initialData={mode === "edit" ? toEdit ?? undefined : undefined}
            onSuccess={handleDone}
          />
        </div>
      )}
    </div>
  )
}
