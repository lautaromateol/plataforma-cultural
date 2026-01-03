"use client"

import * as React from "react"
import { Suspense } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarContentInner } from "./sidebar-content-inner"

const menuItems = [
  { section: "years" },
  { section: "courses" },
  { section: "subjects" },
  { section: "users" },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <Suspense
        fallback={
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Administración</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 p-2">
                  {menuItems.map((item) => (
                    <Skeleton key={item.section} className="h-8 w-full" />
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        }
      >
        <SidebarContentInner />
      </Suspense>
    </Sidebar>
  )
}

