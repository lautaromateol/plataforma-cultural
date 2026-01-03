"use client"

import { useSearchParams } from "next/navigation"
import { YearCRUDPanel } from "@/features/year/components/year-crud-panel"
import { SubjectCRUDPanel } from "@/features/subject/components/subject-crud-panel"
import { CourseCRUDPanel } from "@/features/course/components/course-crud-panel"
import { UserCRUDPanel } from "@/features/user/components/user-crud-panel"
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
      {["years", "courses", "subjects", "users"].includes(section) && (
        <SectionHeader section={section} />
      )}

      {/* Contenido de la sección */}
      {section === "years" && <YearCRUDPanel />}
      {section === "courses" && <CourseCRUDPanel />}
      {section === "subjects" && <SubjectCRUDPanel />}
      {section === "users" && <UserCRUDPanel />}
    </div>
  )
}

