import { Sparkles } from "lucide-react";

export function StudentWelcomeSection({
  name,
  levelName,
  studyPlanName,
}: {
  name: string;
  levelName?: string;
  studyPlanName?: string;
}) {
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl shadow-blue-500/25">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/2" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-blue-200 text-sm font-medium">{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            ¡Hola, {firstName}!
          </h1>
          {(levelName || studyPlanName) && (
            <p className="text-blue-100 text-lg">
              {studyPlanName && <span className="font-semibold">{studyPlanName}</span>}
              {studyPlanName && levelName && " · "}
              {levelName && <span className="font-semibold">{levelName}</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-right">
            <p className="text-blue-200 text-xs uppercase tracking-wider">
              Fecha actual
            </p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}