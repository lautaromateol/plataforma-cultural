"use client";

import { Button } from "@/components/ui/button";
import { useEnrollment } from "../context/enrollment-context";
import {
  MapPin,
  Clock,
  CreditCard,
  ArrowLeft,
  Building2,
  Banknote,
} from "lucide-react";
import { HEADQUARTERS_ADDRESS, HEADQUARTERS_HOURS, ENROLLMENT_FEE } from "../types";

export function PaymentOptionsStep() {
  const { setStep } = useEnrollment();

  const formattedFee = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(ENROLLMENT_FEE);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Opciones de inscripción
        </h2>
        <p className="text-gray-600">
          Podés acercarte a nuestra sede o inscribirte online ahora mismo
        </p>
      </div>

      <div className="space-y-4">
        {/* Opción: Ir a la sede */}
        <button
          onClick={() => setStep("headquarters-info")}
          className="w-full p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-300 text-left transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Acercarme a la sede
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Ideal si tenés alguna situación particular o necesitás
                asesoramiento personalizado (ej: materias aprobadas de
                secundarias anteriores).
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {HEADQUARTERS_ADDRESS}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {HEADQUARTERS_HOURS}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Opción: Pagar online */}
        <button
          onClick={() => setStep("payment")}
          className="w-full p-5 rounded-xl border-2 border-indigo-600 bg-indigo-50 text-left transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-indigo-600 text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Inscribirme ahora
                </h3>
                <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                  Recomendado
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Pagá la matrícula online y recibí tus credenciales de acceso al
                campus virtual de inmediato.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Banknote className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-indigo-600">
                  Matrícula: {formattedFee}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <Button
        variant="outline"
        onClick={() => setStep("plan-selection")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>
    </div>
  );
}
