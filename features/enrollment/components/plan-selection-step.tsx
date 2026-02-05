"use client";

import { useEffect, useState } from "react";
import { differenceInYears, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEnrollment } from "../context/enrollment-context";
import { Clock, Users, Laptop, Check, ArrowLeft, Loader2 } from "lucide-react";
import type { StudyPlanOption } from "../types";

// Mapeo de códigos a iconos
const planIcons: Record<string, React.ReactNode> = {
  PC6: <Users className="w-6 h-6" />,
  PJ4: <Laptop className="w-6 h-6" />,
  PA3: <Clock className="w-6 h-6" />,
};

// Rangos de edad para cada plan
const planAgeRanges: Record<string, { min: number; max: number | null }> = {
  PC6: { min: 12, max: 13 }, // Solo para 12-13 años
  PJ4: { min: 14, max: 17 }, // 14-17 años
  PA3: { min: 18, max: null }, // 18+ años
};

export function PlanSelectionStep() {
  const {
    formData,
    updateFormData,
    setStep,
    setLoading,
    isLoading,
    setError,
    error,
  } = useEnrollment();
  const [plans, setPlans] = useState<StudyPlanOption[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    formData.selectedPlanId || null
  );

  // Calcular edad del estudiante
  const studentAge = formData.birthDate
    ? differenceInYears(
        new Date(),
        parse(formData.birthDate, "yyyy-MM-dd", new Date())
      )
    : 0;

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/enrollment/plans");
        if (!response.ok) throw new Error("Error al obtener planes");
        const data = await response.json();

        // Filtrar planes según la edad del estudiante
        const filteredPlans = data.plans.filter((plan: StudyPlanOption) => {
          const ageRange = planAgeRanges[plan.code];
          if (!ageRange) return true;
          if (ageRange.max === null) {
            return studentAge >= ageRange.min;
          }
          return studentAge >= ageRange.min && studentAge <= ageRange.max;
        });

        setPlans(filteredPlans);
      } catch (err) {
        setError("No pudimos cargar los planes. Por favor, intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [setLoading, setError, studentAge]);

  const handleContinue = () => {
    if (!selectedPlan) return;

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    updateFormData({
      selectedPlanId: plan.id,
      selectedPlanCode: plan.code,
    });

    // Si eligió el plan de 6 años, derivar a sede
    if (plan.code === "PC6") {
      setStep("headquarters-info");
    } else {
      // Para otros planes, mostrar opciones de pago
      setStep("payment-options");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-gray-600">Cargando planes disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Elegí tu plan</h2>
        <p className="text-gray-600">
          Según tu edad ({studentAge} años), estos son los planes disponibles
          para vos
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No hay planes disponibles para tu edad. Por favor, contactate con
            nosotros.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                selectedPlan === plan.id
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    selectedPlan === plan.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {planIcons[plan.code] || <Users className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    {selectedPlan === plan.id && (
                      <Check className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-sm text-indigo-600 mt-1">
                    {plan.targetAudience}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.description}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Duración: {plan.durationYears}{" "}
                    {plan.durationYears === 1 ? "año" : "años"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep("personal-data")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
