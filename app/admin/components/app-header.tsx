"use client"

import { useSearchParams } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LogOut, ChevronRight, Home } from "lucide-react"
import { useLogout } from "@/features/auth/api/use-logout"
import Link from "next/link"

const sectionLabels: Record<string, string> = {
  dashboard: "Panel Principal",
  years: "Años Escolares",
  courses: "Cursos",
  subjects: "Materias",
  users: "Usuarios",
}

export function AppHeader() {
  const { logout, isLoggingOut } = useLogout()
  const searchParams = useSearchParams()
  const section = searchParams.get("section") || "dashboard"
  const currentLabel = sectionLabels[section] || "Panel de Administración"

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-6" />
      </div>

      {/* Breadcrumb */}
      <div className="flex flex-1 items-center gap-2 text-sm">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
        {section && section !== "dashboard" && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{currentLabel}</span>
          </>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  )
}

