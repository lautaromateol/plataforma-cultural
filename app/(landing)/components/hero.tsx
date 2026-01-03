import { Button } from "@/components/ui/button";
import { ArrowRight, Camera } from "lucide-react";

export function Hero() {
    return (
        <section className="pt-52 pb-52 md:pb-64 lg:pb-72 px-2 md:px-28 lg:px-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 container px-4 md:px-0 h-96">
                <div className="rounded-lg p-6 border">
                    <div className="bg-gray-200 flex items-center justify-center h-full w-full">
                     <Camera className="size-16 text-gray-400" />
                    </div>
                </div>
                <div className="flex flex-col justify-around">
                    <div className="space-y-4">
                        <h1 className="text-7xl font-bold text-gray-900 mb-4">Transforma tu futuro desde la comodidad de tu <span className="bg-linear-to-r from-indigo-600 to-indigo-700 text-transparent bg-clip-text">hogar</span></h1>
                        <p className="text-lg text-slate-700 font-light">Descubre una experiencia educativa única en el corazón de Corrientes.</p>
                    </div>
                    <div className="flex items-center gap-x-4">
                        <Button>
                            Matriculate ahora
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button variant="outline">Conóce nuestros planes</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}   