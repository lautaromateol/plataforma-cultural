"use client"

import { useSearchParams } from "next/navigation"
import { SubjectCRUDPanel } from "@/features/subject/components/subject-crud-panel"
import { CourseCRUDPanel } from "@/features/course/components/course-crud-panel"
import { UserCRUDPanel } from "@/features/user/components/user-crud-panel"
import { StudyPlanCRUDPanel } from "@/features/study-plan/components/study-plan-crud-panel"
import { DashboardOverview } from "./dashboard-overview"
import { SectionHeader } from "./section-header"

export function AdminContent() {
  const searchParams = useSearchParams()
  const section = searchParams.get("section")

  // Mostrar dashboard si no hay sección seleccionada
  if (!section || section === "dashboard") {
    return <DashboardOverview />
  }

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      {["courses", "subjects", "users", "planes"].includes(section) && (
        <SectionHeader section={section} />
      )}

      {/* Contenido de la sección */}
      {section === "planes" && <StudyPlanCRUDPanel />}
      {section === "courses" && <CourseCRUDPanel />}
      {section === "subjects" && <SubjectCRUDPanel />}
      {section === "users" && <UserCRUDPanel />}
    </div>
  )
}

