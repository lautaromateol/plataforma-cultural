"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInYears, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEnrollment } from "../context/enrollment-context";
import { User, Calendar, CreditCard, Phone, Mail, Users } from "lucide-react";

const baseSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo"),
  birthDate: z.string().refine((date) => {
    const parsed = parse(date, "yyyy-MM-dd", new Date());
    return !isNaN(parsed.getTime());
  }, "Fecha de nacimiento inválida"),
  dni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener máximo 8 dígitos")
    .regex(/^\d+$/, "El DNI solo debe contener números"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^[\d\s\-+()]+$/, "Teléfono inválido"),
});

const guardianSchema = z.object({
  guardianName: z
    .string()
    .min(3, "El nombre del tutor debe tener al menos 3 caracteres"),
  guardianDni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener máximo 8 dígitos")
    .regex(/^\d+$/, "El DNI solo debe contener números"),
  guardianPhone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^[\d\s\-+()]+$/, "Teléfono inválido"),
  guardianEmail: z.string().email("Email del tutor inválido"),
});

type FormData = z.infer<typeof baseSchema> & Partial<z.infer<typeof guardianSchema>>;

export function PersonalDataStep() {
  const { formData, updateFormData, setStep, setIsMinor, isMinor } = useEnrollment();

  const form = useForm<FormData>({
    resolver: zodResolver(
      isMinor ? baseSchema.merge(guardianSchema) : baseSchema
    ),
    defaultValues: {
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      dni: formData.dni,
      email: formData.email,
      phone: formData.phone,
      guardianName: formData.guardianName || "",
      guardianDni: formData.guardianDni || "",
      guardianPhone: formData.guardianPhone || "",
      guardianEmail: formData.guardianEmail || "",
    },
    mode: "onChange",
  });

  const birthDateValue = form.watch("birthDate");

  // Calcular si es menor de edad cuando cambia la fecha
  const checkMinorStatus = (date: string) => {
    if (!date) return;
    const parsed = parse(date, "yyyy-MM-dd", new Date());
    if (isNaN(parsed.getTime())) return;
    const age = differenceInYears(new Date(), parsed);
    setIsMinor(age < 18);
  };

  const onSubmit = (data: FormData) => {
    updateFormData(data);
    setStep("plan-selection");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Datos personales</h2>
        <p className="text-gray-600">
          Completá tus datos para comenzar el proceso de inscripción
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Datos del estudiante */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre completo
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha de nacimiento
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        checkMinorStatus(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    DNI
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" maxLength={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="3794123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Datos del tutor (si es menor) */}
          {isMinor && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-indigo-600">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">Datos del tutor/responsable</h3>
              </div>
              <p className="text-sm text-gray-500">
                Como sos menor de edad, necesitamos los datos de tu
                tutor/responsable legal.
              </p>

              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo del tutor</FormLabel>
                    <FormControl>
                      <Input placeholder="María García" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianDni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI del tutor</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" maxLength={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono del tutor</FormLabel>
                    <FormControl>
                      <Input placeholder="3794123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del tutor</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tutor@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            Continuar
          </Button>
        </form>
      </Form>
    </div>
  );
}
