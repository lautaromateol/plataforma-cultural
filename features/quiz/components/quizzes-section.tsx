import { FileText } from "lucide-react";
import { QuizList } from "./quiz-list";

interface QuizzesSectionProps {
    subjectId: string;
    colors: {
        bg: string;
        light: string;
        text: string;
        border: string;
    };
}

export function QuizzesSection({ subjectId, colors }: QuizzesSectionProps) {
    return (
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
    )
}