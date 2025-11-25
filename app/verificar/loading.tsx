import { Loader2Icon } from "lucide-react";

export default function loading() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-y-3">
        <div className="animate-spin transition-all">
          <Loader2Icon className="size-16" />
        </div>
        <p className="text-center font-medium">
          Verificando correo electrónico...
        </p>
      </div>
    </main>
  );
}
