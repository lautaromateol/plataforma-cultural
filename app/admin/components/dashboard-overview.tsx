"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGetStats } from "@/features/admin/api/use-get-stats"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  UserCircle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export function DashboardOverview() {
  const { stats, isPending } = useGetStats()

  if (isPending) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    {
      title: "Planes de Estudio",
      value: stats.studyPlansCount,
      description: `${stats.levelsCount} niveles configurados`,
      icon: Calendar,
      href: "/admin/planes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Cursos",
      value: stats.coursesCount,
      description: "Grupos de estudiantes activos",
      icon: GraduationCap,
      href: "/admin?section=courses",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Materias",
      value: stats.subjectsCount,
      description: "Asignaturas disponibles",
      icon: BookOpen,
      href: "/admin?section=subjects",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Usuarios",
      value: stats.usersCount,
      description: `${stats.studentsCount} estudiantes, ${stats.teachersCount} profesores`,
      icon: Users,
      href: "/admin?section=users",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
        <p className="text-muted-foreground mt-2">
          Vista general del sistema de gestión escolar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-2 p-0 h-auto text-xs group-hover:gap-2 transition-all"
                >
                  <Link href={card.href}>
                    Ver detalles
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Students Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Estudiantes</CardTitle>
              <CardDescription>Total en el sistema</CardDescription>
            </div>
            <div className="rounded-lg p-3 bg-blue-50">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {stats.studentsCount}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Estudiantes registrados</span>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Profesores</CardTitle>
              <CardDescription>Equipo docente</CardDescription>
            </div>
            <div className="rounded-lg p-3 bg-green-50">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {stats.teachersCount}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Docentes activos</span>
            </div>
          </CardContent>
        </Card>

        {/* Admins Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Administradores</CardTitle>
              <CardDescription>Personal administrativo</CardDescription>
            </div>
            <div className="rounded-lg p-3 bg-purple-50">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">
              {stats.adminsCount}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              <span>Con acceso administrativo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/planes">
              <Calendar className="mr-2 h-4 w-4" />
              Gestionar Planes
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin?section=courses">
              <GraduationCap className="mr-2 h-4 w-4" />
              Gestionar Cursos
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin?section=subjects">
              <BookOpen className="mr-2 h-4 w-4" />
              Gestionar Materias
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin?section=users">
              <Users className="mr-2 h-4 w-4" />
              Gestionar Usuarios
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

