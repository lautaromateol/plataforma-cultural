"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from "lucide-react";

type UserInfo = {
  id: string;
  name: string;
  email: string | null;
  dni: string;
  role: UserRole;
};

interface CampusHeaderProps {
  user: UserInfo;
}

export function CampusHeader({ user }: CampusHeaderProps) {
  const { logout, isLoggingOut } = useLogout();

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
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Campus Virtual
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Sistema de Gestión Escolar
              </p>
            </div>
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
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    DNI: {user.dni}
                  </p>
                </div>
              </DropdownMenuLabel>
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

