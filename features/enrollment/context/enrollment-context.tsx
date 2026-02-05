"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { EnrollmentFormData, EnrollmentStep, StudyPlanOption } from "../types";

interface EnrollmentContextType {
  isOpen: boolean;
  step: EnrollmentStep;
  formData: EnrollmentFormData;
  isMinor: boolean;
  availablePlans: StudyPlanOption[];
  isLoading: boolean;
  error: string | null;

  openModal: () => void;
  closeModal: () => void;
  setStep: (step: EnrollmentStep) => void;
  updateFormData: (data: Partial<EnrollmentFormData>) => void;
  setIsMinor: (isMinor: boolean) => void;
  setAvailablePlans: (plans: StudyPlanOption[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialFormData: EnrollmentFormData = {
  fullName: "",
  birthDate: "",
  dni: "",
  email: "",
  phone: "",
};

const EnrollmentContext = createContext<EnrollmentContextType | null>(null);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<EnrollmentStep>("personal-data");
  const [formData, setFormData] = useState<EnrollmentFormData>(initialFormData);
  const [isMinor, setIsMinor] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<StudyPlanOption[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateFormData = useCallback((data: Partial<EnrollmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const reset = useCallback(() => {
    setStep("personal-data");
    setFormData(initialFormData);
    setIsMinor(false);
    setAvailablePlans([]);
    setLoading(false);
    setError(null);
  }, []);

  return (
    <EnrollmentContext.Provider
      value={{
        isOpen,
        step,
        formData,
        isMinor,
        availablePlans,
        isLoading,
        error,
        openModal,
        closeModal,
        setStep,
        updateFormData,
        setIsMinor,
        setAvailablePlans,
        setLoading,
        setError,
        reset,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within EnrollmentProvider");
  }
  return context;
}
