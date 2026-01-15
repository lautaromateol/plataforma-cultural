"use client";

import { Upload, FileText } from "lucide-react";
import { AssignmentList } from "@/features/assignment/components/assignment-list";
import { QuizList } from "@/features/quiz/components/quiz-list";

interface ContentSectionsProps {
  subjectId: string;
  colors: {
    bg: string;
    light: string;
    text: string;
    border: string;
  };
  permissions: {
    canEdit: boolean;
  };
}

export function ContentSections({
  subjectId,
  colors,
  permissions,
}: ContentSectionsProps) {
  return (
    <div className="space-y-6">
      {/* Assignments Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colors.light}`}>
              <Upload className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Entregas</h2>
              <p className="text-sm text-slate-500">
                {permissions.canEdit
                  ? "Gestiona las entregas de los estudiantes"
                  : "Sube tus trabajos y revisa tus calificaciones"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <AssignmentList subjectId={subjectId} />
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colors.light}`}>
              <FileText className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Cuestionarios
              </h2>
              <p className="text-sm text-slate-500">
                Realiza cuestionarios y evalúa tu conocimiento
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <QuizList subjectId={subjectId} />
        </div>
      </div>
    </div>
  );
}
