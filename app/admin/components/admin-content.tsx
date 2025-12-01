"use client"

import { useSearchParams } from "next/navigation"
import { YearCRUDPanel } from "@/features/year/components/YearCRUDPanel"
import { SubjectCRUDPanel } from "@/features/subject/components/SubjectCRUDPanel"
import { CourseCRUDPanel } from "@/features/course/components/CourseCRUDPanel"
import { UserCRUDPanel } from "@/features/user/components/UserCRUDPanel"
import { DashboardOverview } from "./dashboard-overview"
import { SectionHeader } from "./section-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function Placeholder({ label }: { label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Esta sección está en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Próximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  )
}

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

