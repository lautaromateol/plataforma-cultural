"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Home,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react"

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useGetStats } from "@/features/admin/api/use-get-stats"

const menuItems = [
  {
    title: "Panel Principal",
    url: "/admin",
    icon: Home,
    section: "dashboard",
    showBadge: false,
  },
  {
    title: "Planes de Estudio",
    url: "/admin?section=planes",
    icon: Calendar,
    section: "planes",
    showBadge: true,
    badgeKey: "studyPlansCount" as const,
  },
  {
    title: "Cursos",
    url: "/admin?section=courses",
    icon: GraduationCap,
    section: "courses",
    showBadge: true,
    badgeKey: "coursesCount" as const,
  },
  {
    title: "Materias",
    url: "/admin?section=subjects",
    icon: BookOpen,
    section: "subjects",
    showBadge: true,
    badgeKey: "subjectsCount" as const,
  },
  {
    title: "Usuarios",
    url: "/admin?section=users",
    icon: Users,
    section: "users",
    showBadge: true,
    badgeKey: "usersCount" as const,
  },
]

export function SidebarContentInner() {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get("section") || "dashboard"
  const { stats, isPending } = useGetStats()

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel de Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const badgeValue = item.badgeKey ? stats[item.badgeKey] : null
                const showBadge = item.showBadge && !isPending && badgeValue !== null

                return (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentSection === item.section}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </div>
                        {showBadge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 px-1.5 text-xs font-medium group-data-[collapsible=icon]:hidden"
                          >
                            {badgeValue}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <p className="font-medium">Plataforma Escolar</p>
          <p>v2.0.0</p>
        </div>
      </SidebarFooter>
    </>
  )
}

