"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnrollmentButton } from "@/features/enrollment";
import Image from "next/image";

export function Header() {
    return (
        <header className="sticky top-0 bg-white w-full flex items-center justify-around py-4 border-b border-gray-100 z-10">
            <div className="flex items-center gap-x-4">
                <div className="w-40 h-20 relative">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <nav>
                    <ul className="flex items-center text-sm gap-6">
                        <li><a href="#inicio" className="hover:text-indigo-500">Inicio</a></li>
                        <li><a href="#modalidades" className="hover:text-indigo-500">Modalidades</a></li>
                        <li><a href="#preguntas" className="hover:text-indigo-500">Preguntas</a></li>
                        <li><a href="#ubicacion" className="hover:text-indigo-500">Ubicación</a></li>
                    </ul>
                </nav>
            </div>
            <nav className="flex items-center justify-center gap-x-6">
                <Button asChild variant="ghost">
                    <Link href="/login" className="text-sm hover:text-indigo-500">
                        Iniciar Sesión
                    </Link>
                </Button>
                <EnrollmentButton className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                    Matriculate
                </EnrollmentButton>
            </nav>
        </header>
    );
}   