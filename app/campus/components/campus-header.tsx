"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLogout } from "@/features/auth/api/use-logout";
import { UserRole } from "@/src/generated/prisma/enums";
import { NotificationsDropdown } from "@/features/notification/components/notifications-dropdown";
import {
  GraduationCap,
  LogOut,
  User,
  ChevronDown,
  BookOpen,
  ArrowUpRightFromSquare,
  Home,
  Award,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { CampusUser } from "@/features/user/schemas";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CampusHeaderProps {
  user: CampusUser;
}

export function CampusHeader({ user }: CampusHeaderProps) {

  const router = useRouter()
  const pathname = usePathname()

  const { logout, isLoggingOut } = useLogout();

  const navItems = [
    {
      name: "Inicio",
      href: "/campus",
      icon: Home,
    },
    {
      name: "Calificaciones",
      href: "/campus/calificaciones",
      icon: Award,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "STUDENT":
        return {
          label: "Estudiante",
          icon: GraduationCap,
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        };
      case "TEACHER":
        return {
          label: "Profesor",
          icon: BookOpen,
          variant: "secondary" as const,
          className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
        };
      default:
        return {
          label: "Usuario",
          icon: User,
          variant: "secondary" as const,
          className: "",
        };
    }
  };

  const roleBadge = getRoleBadge(user.role);
  const RoleIcon = roleBadge.icon;

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="px-4 max-w-md md:max-w-11/12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Campus Virtual
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Sistema de Gestión Escolar
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 relative",
                        isActive
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Notifications & User Menu */}
          <div className="flex items-center gap-2">
            <NotificationsDropdown userRole={user.role} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge className={`text-xs ${roleBadge.className}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleBadge.label}
                        </Badge>
                      </div>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuItem
                  onClick={() => router.push(`/campus/usuario/${user.id}`)}
                  disabled={isLoggingOut}
                  className="text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50 cursor-pointer"
                >
                  <ArrowUpRightFromSquare className="mr-2 h-4 w-4" />
                  Ir al perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

