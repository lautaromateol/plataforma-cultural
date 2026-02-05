import { Upload } from "lucide-react";
import { AssignmentList } from "./assignment-list";
import { useGetUser } from "@/features/auth/api/use-get-user";

interface AssignmentsSectionProps {
    subjectId: string;
    colors: {
        bg: string;
        light: string;
        text: string;
        border: string;
    };
}

export function AssignmentsSection({ subjectId, colors }: AssignmentsSectionProps) {

    const { user } = useGetUser();
    const canEdit = user?.role === "TEACHER";

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${colors.light}`}>
                        <Upload className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Entregas</h2>
                        <p className="text-sm text-slate-500">
                            {canEdit
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
    )
}