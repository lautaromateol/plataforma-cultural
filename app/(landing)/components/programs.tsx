import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function Programs() {
    return (
        <section id="programas" className="py-32 space-y-12 text-center">
            <div className="space-y-6">
                <h2 className="text-5xl font-bold">
                    <span className="border-b-6 border-transparent bg-linear-to-r from-indigo-600 to-indigo-700 bg-size-[100%_4px] bg-no-repeat bg-bottom pb-1">
                        Plan de Estudios
                    </span> del Instituto
                </h2>
                <p className="font-light text-lg">
                    Nuestro programa académico está diseñado para brindarte una formación integral en ciencias de la computación.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 px-8 md:px-0 gap-8 max-w-6xl mx-auto">

                <Program
                    year={1}
                    courses={[
                        "Introducción a la Programación",
                        "Estructuras de Datos",
                        "Matemáticas Discretas",
                        "Fundamentos de Bases de Datos",
                    ]}
                />
                <Program
                    year={2}
                    courses={[
                        "Programación Orientada a Objetos",
                        "Algoritmos y Complejidad",
                        "Sistemas Operativos",
                        "Redes de Computadoras",
                    ]}
                />
                <Program
                    year={3}
                    courses={[
                        "Desarrollo Web",
                        "Ingeniería de Software",
                        "Seguridad Informática",
                        "Inteligencia Artificial",
                    ]}
                />
                <Program
                    year={4}
                    courses={[
                        "Desarrollo de Aplicaciones Móviles",
                        "Computación en la Nube",
                        "Big Data y Análisis de Datos",
                        "Proyecto de Fin de Carrera",
                    ]}
                />
                <Program
                    year={5}
                    courses={[
                        "Aprendizaje Automático",
                        "Visión por Computadora",
                        "Robótica",
                        "Ética y Legislación en Tecnología",
                    ]}
                />
                <Program
                    year={6}
                    courses={[
                        "Desarrollo de Juegos",
                        "Realidad Aumentada y Virtual",
                        "Computación Cuántica",
                        "Seminario de Investigación",
                    ]}
                />
            </div>
        </section>
    );
}

interface ProgramProps {
    year: number;
    courses: string[];
}

export function Program({ year, courses }: ProgramProps) {
    return (
        <div className="space-y-4 rounded-lg shadow-md p-4 bg-indigo-100/20 border border-gray-200">
            <h4 className="text-left text-3xl font-semibold p-2 rounded-lg text-indigo-900">{year}° Año</h4>
            <ul className="list-disc list-inside space-y-2 text-left">
                {courses.map((course, index) => (
                    <li className="font-light text-indigo-900" key={index}>{course}</li>
                ))}
            </ul>
            <Button className="mt-4 w-full">Ver más</Button>
        </div>
    );
}