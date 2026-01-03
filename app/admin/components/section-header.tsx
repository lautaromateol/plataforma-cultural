"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGetStats } from "@/features/admin/api/use-get-stats"
import {
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SectionHeaderProps {
  section: string
}

const sectionConfig = {
  years: {
    title: "Años Escolares",
    description: "Gestiona los niveles educativos del sistema",
    icon: Calendar,
    statKey: "yearsCount" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  courses: {
    title: "Cursos",
    description: "Administra los grupos de estudiantes por año académico",
    icon: GraduationCap,
    statKey: "coursesCount" as const,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  subjects: {
    title: "Materias",
    description: "Configura las asignaturas disponibles en cada año",
    icon: BookOpen,
    statKey: "subjectsCount" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  users: {
    title: "Usuarios",
    description: "Gestiona estudiantes, profesores y administradores",
    icon: Users,
    statKey: "usersCount" as const,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
}

export function SectionHeader({ section }: SectionHeaderProps) {
  const { stats, isPending } = useGetStats()
  const config = sectionConfig[section as keyof typeof sectionConfig]

  if (!config) return null

  const Icon = config.icon
  const count = stats[config.statKey]

  return (
    <Card className="mb-6 border-l-4" style={{ borderLeftColor: config.color.replace('text-', '#') }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${config.bgColor}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <CardTitle className="text-2xl">{config.title}</CardTitle>
                <CardDescription className="mt-1">
                  {config.description}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${config.color}`} />
                  <span className={`text-3xl font-bold ${config.color}`}>
                    {count}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total registrados
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional específica por sección */}
        {section === "users" && !isPending && (
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {stats.studentsCount} Estudiantes
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <GraduationCap className="h-3 w-3" />
              {stats.teachersCount} Profesores
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {stats.adminsCount} Admins
            </Badge>
          </div>
        )}
      </CardHeader>
    </Card>
  )
}

