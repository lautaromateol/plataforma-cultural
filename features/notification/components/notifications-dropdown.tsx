"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetNotifications } from "../api/use-get-notifications";
import { useMarkNotificationRead } from "../api/use-mark-notification-read";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { client } from "@/lib/client";

type Notification = {
  id: string;
  type: "QUIZ" | "ASSIGNMENT";
  title: string;
  message: string;
  relatedId: string;
  courseSubjectId: string;
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
};

interface NotificationsDropdownProps {
  userRole: string;
}

export function NotificationsDropdown({ userRole }: NotificationsDropdownProps) {
  const router = useRouter();
  const { notifications, isLoading } = useGetNotifications(userRole === "STUDENT");
  const { markAsRead } = useMarkNotificationRead();

  // Solo mostrar para estudiantes
  if (userRole !== "STUDENT") {
    return null;
  }

  const unreadCount = (notifications as Notification[] | undefined)?.filter(
    (n) => !n.isRead
  ).length || 0;

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      markAsRead({ notificationId: notification.id });
    }

    // Obtener el subjectId desde el courseSubjectId
    try {
      const response = await (client.api as any).notification["subject"][":courseSubjectId"].$get({
        param: { courseSubjectId: notification.courseSubjectId },
      });

      if (response.ok) {
        const data = await response.json() as { subjectId: string };
        router.push(`/campus/materia/${data.subjectId}`);
      } else {
        router.push(`/campus`);
      }
    } catch (error) {
      console.error("Error al obtener subjectId:", error);
      router.push(`/campus`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "QUIZ":
        return <FileText className="w-4 h-4" />;
      case "ASSIGNMENT":
        return <Upload className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "bg-blue-100 text-blue-700";
      case "ASSIGNMENT":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications || (notifications as Notification[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {(notifications as Notification[]).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-slate-50 cursor-pointer transition-colors",
                    !notification.isRead && "bg-blue-50/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        getNotificationColor(notification.type)
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "text-sm font-medium",
                            !notification.isRead && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
