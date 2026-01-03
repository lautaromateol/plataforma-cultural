import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Detalles del Año - Plataforma Escolar",
  description: "Información detallada sobre el año escolar",
}

export default function YearLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

