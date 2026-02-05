"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEnrollment } from "../context/enrollment-context";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Shield,
  Lock,
} from "lucide-react";
import { ENROLLMENT_FEE } from "../types";

export function PaymentStep() {
  const { formData, setStep, setLoading, isLoading, setError } = useEnrollment();
  const [isProcessing, setIsProcessing] = useState(false);

  const formattedFee = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(ENROLLMENT_FEE);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Crear preferencia de pago en Mercado Pago
      const response = await fetch("/api/enrollment/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          amount: ENROLLMENT_FEE,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el pago");
      }

      const data = await response.json();

      // Redirigir a Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (error) {
      setError(
        "Hubo un error al procesar el pago. Por favor, intentá de nuevo."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Pagar matrícula</h2>
        <p className="text-gray-600">
          Serás redirigido a Mercado Pago para completar el pago de forma segura
        </p>
      </div>

      {/* Resumen del pago */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b">
          <span className="text-gray-600">Concepto</span>
          <span className="font-medium">Matrícula de inscripción</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b">
          <span className="text-gray-600">Estudiante</span>
          <span className="font-medium">{formData.fullName}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b">
          <span className="text-gray-600">DNI</span>
          <span className="font-medium">{formData.dni}</span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-900">Total a pagar</span>
          <span className="font-bold text-indigo-600">{formattedFee}</span>
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
        <Shield className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800">
          Tu pago es procesado de forma segura por Mercado Pago. No almacenamos
          datos de tu tarjeta.
        </p>
      </div>

      {/* Métodos de pago */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Métodos de pago aceptados</p>
        <div className="flex justify-center gap-4 text-gray-400">
          <span className="text-xs">Tarjetas de crédito</span>
          <span>•</span>
          <span className="text-xs">Tarjetas de débito</span>
          <span>•</span>
          <span className="text-xs">Transferencia</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep("payment-options")}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pagar {formattedFee}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
