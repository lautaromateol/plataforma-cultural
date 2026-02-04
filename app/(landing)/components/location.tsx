"use client"
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Location() {
    return (
        <section id="ubicacion" className="py-20 md:py-32 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Visitanos en <span className="text-indigo-600">Corrientes</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Estamos ubicados en el corazón de la ciudad, con fácil acceso desde cualquier punto
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Información de contacto */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Instituto Centro Cultural Correntino
                            </h3>
                            <p className="text-gray-600 text-lg">
                                Te esperamos en nuestras instalaciones para brindarte toda la información que necesitás sobre nuestras modalidades de cursado.
                            </p>
                        </div>

                        {/* Detalles de contacto */}
                        <div className="space-y-4">
                            <ContactItem
                                icon={<MapPin className="w-5 h-5" />}
                                title="Dirección"
                                content="Corrientes, Argentina"
                                description="Centro de la ciudad"
                            />

                            <ContactItem
                                icon={<Phone className="w-5 h-5" />}
                                title="Teléfono"
                                content="Consultá nuestros números de contacto"
                                description="Atención de lunes a viernes"
                            />

                            <ContactItem
                                icon={<Mail className="w-5 h-5" />}
                                title="Email"
                                content="Escribinos para más información"
                                description="Respondemos en 24hs"
                            />

                            <ContactItem
                                icon={<Clock className="w-5 h-5" />}
                                title="Horarios de atención"
                                content="Lunes a Viernes: 8:00 - 20:00"
                                description="Sábados: 9:00 - 13:00"
                            />
                        </div>

                        {/* Call to action */}
                        <div className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-600">
                            <h4 className="font-bold text-gray-900 mb-2">
                                Agendá tu visita
                            </h4>
                            <p className="text-gray-600 text-sm mb-4">
                                Preferís venir en persona? Coordiná una visita guiada y conocé nuestras instalaciones.
                            </p>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                                Agendar visita
                            </button>
                        </div>
                    </div>

                    {/* Mapa */}
                    <div className="relative">
                        <div className="rounded-2xl overflow-hidden shadow-xl h-full min-h-[400px] lg:min-h-[600px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3539.9731967688413!2d-58.8381567!3d-27.470093799999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94456ca59e4fffd1%3A0x75758f06d9bb5c32!2sCentro%20Cultural%20Correntino!5e0!3m2!1ses-419!2sar!4v1770134741117!5m2!1ses-419!2sar"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 w-full h-full"
                            ></iframe>
                        </div>
                        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
                            <p className="text-sm font-semibold text-gray-900">
                                📍 Centro Cultural Correntino
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensaje final */}
                <div className="mt-16 text-center bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-12 text-white">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        ¿Listo para comenzar tu futuro?
                    </h3>
                    <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                        No dejes pasar más tiempo. Terminá tu secundaria y abrí las puertas a nuevas oportunidades laborales y académicas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg">
                            Inscribite ahora
                        </button>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-bold text-lg">
                            Solicitar información
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface ContactItemProps {
    icon: React.ReactNode;
    title: string;
    content: string;
    description?: string;
}

function ContactItem({ icon, title, content, description }: ContactItemProps) {
    return (
        <div className="flex gap-4 items-start">
            <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                <div className="text-indigo-600">
                    {icon}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-gray-700">{content}</p>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
        </div>
    );
}
