export interface EnrollmentFormData {
  // Datos del estudiante
  fullName: string;
  birthDate: string;
  dni: string;
  email: string;
  phone: string;

  // Datos del tutor (si es menor de edad)
  guardianName?: string;
  guardianDni?: string;
  guardianPhone?: string;
  guardianEmail?: string;

  // Plan seleccionado
  selectedPlanId?: string;
  selectedPlanCode?: string;
}

export interface StudyPlanOption {
  id: string;
  name: string;
  code: string;
  description: string | null;
  durationYears: number;
  targetAudience: string | null;
  minAge: number;
  maxAge: number | null;
}

export type EnrollmentStep =
  | "personal-data"
  | "plan-selection"
  | "payment-options"
  | "headquarters-info"
  | "payment"
  | "success";

export interface EnrollmentState {
  step: EnrollmentStep;
  formData: EnrollmentFormData;
  isMinor: boolean;
  availablePlans: StudyPlanOption[];
  isLoading: boolean;
  error: string | null;
}

// Constantes
export const ENROLLMENT_FEE = 80000; // 80 mil pesos argentinos
export const HEADQUARTERS_ADDRESS = "La Rioja 1145, Ciudad de Corrientes, Argentina";
export const HEADQUARTERS_HOURS = "Lunes a Viernes de 7:00 a 21:00";
