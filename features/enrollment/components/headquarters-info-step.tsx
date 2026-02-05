"use client";

import { Button } from "@/components/ui/button";
import { useEnrollment } from "../context/enrollment-context";
import { MapPin, Clock, Phone, ArrowLeft, Building2 } from "lucide-react";
import { HEADQUARTERS_ADDRESS, HEADQUARTERS_HOURS } from "../types";

export function HeadquartersInfoStep() {
  const { setStep, closeModal, reset } = useEnrollment();

  const handleClose = () => {
    closeModal();
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Acercate a nuestra sede
        </h2>
        <p className="text-gray-600">
          Para el plan completo de 6 años, te invitamos a acercarte a nuestra
          sede principal para completar tu inscripción de manera presencial.
        </p>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Dirección</p>
            <p className="text-gray-600">{HEADQUARTERS_ADDRESS}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Horario de atención</p>
            <p className="text-gray-600">{HEADQUARTERS_HOURS}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Teléfono</p>
            <p className="text-gray-600">+54 379 4123456</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Importante:</strong> Recordá traer tu DNI y el de tu
          tutor/responsable (si sos menor de edad) para completar la
          inscripción.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep("plan-selection")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button
          onClick={handleClose}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          Entendido
        </Button>
      </div>
    </div>
  );
}
