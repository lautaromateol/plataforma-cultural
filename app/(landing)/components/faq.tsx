"use client"
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
    return (
        <section id="preguntas" className="py-20 md:py-32 px-4 md:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Preguntas <span className="text-indigo-600">frecuentes</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Respondemos las dudas más comunes sobre nuestras modalidades de estudio
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    <FAQItem
                        question="¿El título que obtengo es oficial?"
                        answer="Sí, absolutamente. El Instituto Centro Cultural Correntino otorga un título secundario oficial reconocido por el Ministerio de Educación de la Provincia de Corrientes. Este título tiene validez nacional y te permite continuar con estudios superiores en cualquier universidad o instituto del país."
                    />

                    <FAQItem
                        question="¿Cómo funciona la modalidad híbrida?"
                        answer="La modalidad híbrida combina clases presenciales con clases virtuales. Podés cursar algunas materias desde tu casa a través de nuestra plataforma online, y asistir a clases presenciales para otras materias o consultas. Esto te brinda mayor flexibilidad para organizar tu tiempo y adaptarte a tus responsabilidades laborales o personales."
                    />

                    <FAQItem
                        question="¿Puedo trabajar mientras estudio?"
                        answer="Sí, nuestras modalidades están diseñadas especialmente para personas que trabajan. La modalidad híbrida y los 3 turnos disponibles (mañana, tarde y noche) te permiten compatibilizar el estudio con tu trabajo u otras actividades. Además, el formato acelerado te ayuda a obtener tu título en menos tiempo."
                    />

                    <FAQItem
                        question="¿Qué diferencia hay entre el plan de 3, 4 y 6 años?"
                        answer="El plan de 6 años es el programa completo para estudiantes que comienzan desde primer año (12 años en adelante). El plan de 4 años es acelerado, ideal para estudiantes de 14 a 17 años en formato híbrido. El plan de 3 años o menos es el más rápido, diseñado para mayores de edad que necesitan completar la secundaria rápidamente, también en formato híbrido."
                    />

                    <FAQItem
                        question="¿Necesito tener conocimientos previos de informática?"
                        answer="No es necesario tener conocimientos avanzados. Para las clases virtuales solo necesitás saber usar aplicaciones básicas como videollamadas y navegación web. Además, contamos con soporte técnico y orientación para ayudarte a familiarizarte con las herramientas digitales."
                    />

                    <FAQItem
                        question="¿Cuándo puedo inscribirme?"
                        answer="Las inscripciones están abiertas durante todo el año. Contamos con varios periodos de inicio de cursada para que puedas comenzar cuando mejor te convenga. Te recomendamos contactarnos para conocer las fechas específicas de inicio del próximo ciclo lectivo."
                    />

                    <FAQItem
                        question="¿Qué pasa si tengo materias previas de otro colegio?"
                        answer="Evaluamos tu situación académica particular y reconocemos las materias que ya tengas aprobadas de instituciones anteriores. De esta manera, solo cursás lo que realmente necesitás para completar tu secundaria, optimizando tu tiempo de estudio."
                    />

                    <FAQItem
                        question="¿Cómo son los exámenes en la modalidad híbrida?"
                        answer="Los exámenes pueden ser presenciales o virtuales según la materia. Para las evaluaciones presenciales, coordinamos horarios flexibles que se adapten a tu disponibilidad. Las evaluaciones virtuales se realizan a través de nuestra plataforma con todas las medidas de seguridad correspondientes."
                    />
                </div>

                {/* CTA */}
                <div className="mt-12 text-center p-8 bg-white rounded-2xl shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        ¿Tenés otra consulta?
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Estamos para ayudarte. Contactanos y te responderemos a la brevedad.
                    </p>
                    <a
                        href="#contacto"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Contactar
                    </a>
                </div>
            </div>
        </section>
    );
}

interface FAQItemProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900 text-lg">
                    {question}
                </span>
                <ChevronDown
                    className={cn(
                        "w-5 h-5 text-indigo-600 transition-transform shrink-0",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96" : "max-h-0"
                )}
            >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}
