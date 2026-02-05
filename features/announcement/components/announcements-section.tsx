"use client";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, GraduationCap, Sparkles, Upload, Bell, Loader, ChevronDown } from "lucide-react";
import { Announcement, useGetAnnouncements } from "@/features/announcement/api/use-get-announcements";
import { useGetUser } from "@/features/auth/api/use-get-user";
import { useOpenCreateAnnouncement } from "../hooks/use-open-create-announcement";
import { useDeleteAnnouncement } from "../api/use-delete-announcement";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface AnnouncementsSectionProps {
    subjectId: string;
    colors: {
        bg: string;
        light: string;
        text: string;
        border: string;
    };
}

export function AnnouncementsSection({
    subjectId,
    colors
}: AnnouncementsSectionProps) {
    const { announcements, isLoadingAnnouncements } = useGetAnnouncements({ subjectId })

    const { user } = useGetUser()

    const canEdit = user?.role === "TEACHER"

    const { open } = useOpenCreateAnnouncement()

    const { deleteAnnouncement, isDeletingAnnouncement } = useDeleteAnnouncement({ subjectId })

    const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set())

    const toggleExpanded = (announcementId: string) => {
        const newExpanded = new Set(expandedAnnouncements)
        if (newExpanded.has(announcementId)) {
            newExpanded.delete(announcementId)
        } else {
            newExpanded.add(announcementId)
        }
        setExpandedAnnouncements(newExpanded)
    }

    const handleDeleteAnnouncement = (announcementId: string) => {
        deleteAnnouncement(announcementId)
    }

    const isMessageTruncated = (message: string) => {
        return message.length > 200
    }

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${colors.light}`}>
                            <Bell className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Avisos</h2>
                            <p className="text-sm text-slate-500">
                                {announcements?.length} {announcements?.length === 1 ? "aviso" : "avisos"}
                            </p>
                        </div>
                    </div>
                    {canEdit && (
                        <Button
                            disabled={isLoadingAnnouncements}
                            onClick={() => open(subjectId)}
                            className={`bg-linear-to-r hover:opacity-90 shadow-lg shadow-slate-200 ${colors.bg}`}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Crear aviso
                        </Button>
                    )}
                </div>

                <div className="p-6">
                    {isLoadingAnnouncements ?
                        (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl">
                                        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                                        <div className="flex-1 space-y-3">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                        :
                        !announcements || announcements.length === 0 ? (
                            <div className="text-center py-16">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${colors.light}`}>
                                    <Bell className={`w-10 h-10 ${colors.text}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    No hay avisos aún
                                </h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    {canEdit
                                        ? "Escribe un aviso para los alumnos del curso."
                                        : "Los profesores no subieron ningún aviso para este curso"}
                                </p>
                                {canEdit && (
                                    <Button
                                        onClick={() => open(subjectId)}
                                        className={`mt-6 bg-linear-to-r hover:opacity-90 ${colors.bg}`}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Subir primer aviso
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {announcements.map((announcement: Announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="group relative flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div
                                            className={`shrink-0 p-3.5 rounded-2xl bg-linear-to-br ${colors.bg} text-white shadow-lg`}
                                        >
                                            <Bell className="size-4/6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-800">
                                                {announcement.title}
                                            </h4>
                                            <p className={`text-sm text-slate-600 mb-3 ${expandedAnnouncements.has(announcement.id)
                                                    ? ""
                                                    : "line-clamp-2"
                                                }`}>
                                                {announcement.message}
                                            </p>
                                            {isMessageTruncated(announcement.message) && (
                                                <button
                                                    onClick={() => toggleExpanded(announcement.id)}
                                                    className={`text-xs font-medium mb-3 flex items-center gap-1 transition-colors ${expandedAnnouncements.has(announcement.id)
                                                            ? "text-slate-900 hover:text-slate-700"
                                                            : `${colors.text} hover:opacity-80`
                                                        }`}
                                                >
                                                    {expandedAnnouncements.has(announcement.id) ? "Leer menos" : "Leer más"}
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedAnnouncements.has(announcement.id) ? "rotate-180" : ""
                                                        }`} />
                                                </button>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(announcement.createdAt).toLocaleDateString("es-ES", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    {announcement.teacher.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>
        </>
    );
}
