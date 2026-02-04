import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Clock, Home } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-8 lg:px-16 bg-linear-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Contenido principal */}
                    <div className="space-y-8">
                        <div className="inline-block">
                            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                Instituto Centro Cultural Correntino
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Terminá tu secundaria{" "}
                                <span className="text-indigo-600">desde casa</span>{" "}
                                en tiempo acelerado
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                Obtené tu título secundario oficial con modalidad híbrida o presencial.
                                Estudiá a tu ritmo y alcanzá tus metas educativas.
                            </p>
                        </div>

                        {/* Características destacadas */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Acelerado</p>
                                    <p className="text-sm text-gray-600">En menos tiempo</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Home className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Desde casa</p>
                                    <p className="text-sm text-gray-600">Modalidad híbrida</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Oficial</p>
                                    <p className="text-sm text-gray-600">Título válido</p>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                Inscribite ahora
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                                Ver modalidades
                            </Button>
                        </div>
                    </div>

                    {/* Imagen/Visual */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-linear-to-br from-indigo-500 to-blue-600 p-8 md:p-12">
                            <div className="relative z-10 space-y-6 text-white">
                                <div className="inline-block p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <GraduationCap className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold">
                                    Más de 500 estudiantes graduados
                                </h3>
                                <p className="text-white/90 text-lg">
                                    Formando el futuro de Corrientes desde hace más de 20 años
                                </p>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-3xl font-bold">3</p>
                                        <p className="text-sm text-white/80">Turnos disponibles</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-3xl font-bold">100%</p>
                                        <p className="text-sm text-white/80">Título oficial</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decoración de fondo */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}