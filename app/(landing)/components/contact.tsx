import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Contact() {
    return (
        <section id="contacto" className="py-48 px-6 bg-indigo-700 text-white space-y-12 text-center">
            <div className="space-y-4">
                <h2 className="text-5xl font-bold">Comienza tu futuro académico hoy</h2>
                <p className="font-light text-lg">Únete a miles de estudiantes que están alcanzando sus metas educativas con flexibilidad y excelencia académica.</p>
            </div>
            <div className="flex items-center gap-x-2 justify-center mt-6">
                <Button variant="secondary" size="lg">
                    Matriculate
                    <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button variant="secondary" size="lg">Contáctanos</Button>
            </div>
        </section>
    );
}   