"use client"
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";

export function Plans() {
    return (
        <section id="planes" className="py-32 flex flex-col gap-y-12 items-center text-center bg-slate-200">
            <div className="space-y-6">
                <h2 className="text-5xl font-bold">Elige el plan perfecto <span className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-1 rounded-lg">para ti</span></h2>
                <p className="font-light text-lg">Opciones flexibles para cada estudiante. Todos los planes incluyen certificación oficial.</p>
            </div>
            <div className="space-y-4 max-w-4xl md:max-w-5xl lg:max-w-6xl w-full px-4 md:px-0">
                <Plan title="Ciclo básico" description="Realiza los primeros 3 años de secundaria, en un solo año." />
                <Plan title="Secundario completo" description="Completa toda la secundaria en 2 años" favourite />
                <Plan title="Ciclo avanzado" description="Realiza los últimos 3 años de secundaria, en un solo año." />
            </div>

        </section>
    )
}

interface PlanProps {
    title: string;
    description: string;
    favourite?: boolean;
}

export function Plan({ title, description, favourite }: PlanProps) {
    return (
        <div className={cn(
            "relative grid grid-cols-1 md:grid-cols-4 bg-white rounded-xl shadow-md",
            favourite ? "border-2 border-indigo-200 md:scale-100 lg:scale-105" : "transition-transform duration-75 hover:scale-105"
        )}>
            <div className={cn(
                "absolute top-0 right-0 px-3 py-1 rounded-bl-lg rounded-tr-xl text-sm font-medium text-white",
                favourite ? "bg-indigo-600" : "bg-gray-400"
            )}>
                {favourite ? "Más popular" : "Estándar"}
            </div>
            <div className="md:col-span-1 bg-slate-100/80 flex items-center justify-center rounded-l-xl">
                <Camera className="w-12 h-12" />
            </div>
            <div className="flex flex-col md:col-span-3 gap-y-6 p-4">
                <div className="space-y-1 text-left">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <p className="text-lg font-light text-gray-500">{description}</p>
                </div>
                <ul className="flex flex-col items-start">
                    <li className="before:content-['✓'] before:mr-2">Acceso ilimitado a cursos</li>
                    <li className="before:content-['✓'] before:mr-2">Certificación oficial</li>
                    <li className="before:content-['✓'] before:mr-2">Soporte 24/7</li>
                    <li className="before:content-['✓'] before:mr-2">Materiales descargables</li>
                </ul>
            </div>
        </div>
    )
}