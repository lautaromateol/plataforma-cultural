import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 bg-white w-full flex items-center justify-around py-4 border-b border-gray-100 z-10">
            <div className="flex items-center gap-x-2">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold">Centro Cultural Correntino</h1>
            </div>
            <nav>
                <ul className="flex items-center text-sm gap-6">
                    <li><a href="#inicio" className="hover:text-indigo-500">Inicio</a></li>
                    <li><a href="#planes" className="hover:text-indigo-500">Planes</a></li>
                    <li><a href="#programas" className="hover:text-indigo-500">Programa</a></li>
                    <li><a href="#contacto" className="hover:text-indigo-500">Contacto</a></li>
                </ul>
            </nav>
            <nav className="flex items-center justify-center gap-x-6">
                <Button asChild variant="ghost">
                    <Link href="/login" className="text-sm hover:text-indigo-500">
                        Iniciar Sesión
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/register" className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                        Matriculate
                    </Link>
                </Button>
            </nav>
        </header>
    );
}   