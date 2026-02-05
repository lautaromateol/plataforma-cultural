"use client"
import { cn } from "@/lib/utils";
import { Users, Laptop, Calendar, Clock } from "lucide-react";
import { EnrollmentButton } from "@/features/enrollment";

export function Modalities() {
    return (
        <section id="modalidades" className="py-20 md:py-32 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Modalidades de <span className="text-indigo-600">cursado</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Elegí la modalidad que mejor se adapte a tu situación y objetivos.
                        Todas nuestras opciones otorgan título oficial.
                    </p>
                </div>

                {/* Modalidades Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <ModalityCard
                        icon={<Users className="w-8 h-8" />}
                        title="6 años de estudio"
                        subtitle="Desde los 12 años"
                        description="Programa completo de educación secundaria con modalidad presencial."
                        features={[
                            "Inicio desde 1er año",
                            "Modalidad presencial",
                            "Acompañamiento continuo",
                            "Título oficial al finalizar"
                        ]}
                        highlight={false}
                    />

                    <ModalityCard
                        icon={<Laptop className="w-8 h-8" />}
                        title="4 años de estudio"
                        subtitle="14 a 17 años"
                        description="Plan acelerado que combina lo mejor de la educación presencial y virtual."
                        features={[
                            "Formato presencial o híbrido",
                            "Clases presenciales y virtuales",
                            "Flexibilidad horaria",
                            "Seguimiento personalizado"
                        ]}
                        highlight={true}
                    />

                    <ModalityCard
                        icon={<Clock className="w-8 h-8" />}
                        title="3 años o menos"
                        subtitle="Mayores de edad"
                        description="La opción más rápida para adultos que quieren completar su secundaria."
                        features={[
                            "Formato presencial o híbrido",
                            "Máxima flexibilidad",
                            "Ideal para trabajadores",
                            "Ritmo acelerado"
                        ]}
                        highlight={false}
                    />
                </div>

                {/* Info adicional */}
                <div className="bg-indigo-50 rounded-2xl p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <div className="inline-block p-2 bg-indigo-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                3 turnos disponibles
                            </h3>
                            <p className="text-gray-600 text-lg">
                                Para la modalidad presencial, ofrecemos turnos de mañana, tarde y noche,
                                adaptándonos a tus horarios y compromisos.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">Mañana</p>
                                    <p className="font-semibold text-indigo-600">8:00 - 12:00</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">Tarde</p>
                                    <p className="font-semibold text-indigo-600">14:00 - 18:00</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">Noche</p>
                                    <p className="font-semibold text-indigo-600">19:00 - 23:00</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 italic">
                                * Los horarios son orientativos y pueden variar según la modalidad elegida
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

interface ModalityCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    highlight?: boolean;
}

function ModalityCard({ icon, title, subtitle, description, features, highlight = false }: ModalityCardProps) {
    return (
        <div className={cn(
            "relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl",
            highlight
                ? "bg-indigo-600 text-white shadow-xl scale-105 md:scale-110"
                : "bg-gray-50 hover:bg-gray-100"
        )}>
            {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full shadow-md">
                    Más elegida
                </div>
            )}

            <div className="space-y-6">
                {/* Icon */}
                <div className={cn(
                    "inline-block p-3 rounded-xl",
                    highlight ? "bg-white/20" : "bg-indigo-100"
                )}>
                    <div className={highlight ? "text-white" : "text-indigo-600"}>
                        {icon}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className={cn(
                        "text-2xl font-bold",
                        highlight ? "text-white" : "text-gray-900"
                    )}>
                        {title}
                    </h3>
                    <p className={cn(
                        "text-sm font-medium",
                        highlight ? "text-indigo-100" : "text-indigo-600"
                    )}>
                        {subtitle}
                    </p>
                    <p className={cn(
                        "text-base",
                        highlight ? "text-white/90" : "text-gray-600"
                    )}>
                        {description}
                    </p>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <svg
                                className={cn(
                                    "w-5 h-5 mt-0.5 shrink-0",
                                    highlight ? "text-white" : "text-indigo-600"
                                )}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className={cn(
                                "text-sm",
                                highlight ? "text-white/90" : "text-gray-700"
                            )}>
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <EnrollmentButton
                    className={cn(
                        "w-full mt-4",
                        highlight
                            ? "bg-white text-indigo-600 hover:bg-gray-100"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                    )}
                >
                    Inscribirme
                </EnrollmentButton>
            </div>
        </div>
    )
}