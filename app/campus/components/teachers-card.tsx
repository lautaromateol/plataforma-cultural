"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, GraduationCap } from "lucide-react";
import { getInitials } from "@/lib/file-utils";

type Teacher = {
  id: string;
  name: string;
  email: string | null;
};

interface TeachersCardProps {
  teachers: Teacher[];
}

export function TeachersCard({ teachers }: TeachersCardProps) {
  if (teachers.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-80">
      <div className="px-6 py-5 border-b border-slate-200 shrink-0 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-200">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Profesores</h2>
        </div>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {teachers.map((teacher: Teacher) => (
          <div
            key={teacher.id}
            className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors border border-slate-200"
          >
            <Avatar className="h-12 w-12 ring-2 ring-blue-200 shadow-md">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {getInitials(teacher.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900">{teacher.name}</p>
              {teacher.email && (
                <p className="text-sm text-slate-600 truncate flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {teacher.email}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
