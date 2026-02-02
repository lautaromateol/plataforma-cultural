"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Calendar, User, Users, IdCard, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UserPersonalInfoProps {
  user: any
}

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
    <div className="mt-0.5 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="font-medium text-sm wrap-break-word">{value}</p>
    </div>
  </div>
)

export function UserPersonalInfo({ user }: UserPersonalInfoProps) {
  const studentProfile = user.studentProfile
  const teacherProfile = user.teacherProfile

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Información General */}
      <Card className="border-2">
        <CardHeader className="bg-linear-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Información General
          </CardTitle>
          <CardDescription>
            Datos principales del usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <InfoItem icon={User} label="Nombre Completo" value={user.name} />
            <InfoItem icon={IdCard} label="DNI" value={user.dni} />
            {user.email && <InfoItem icon={Mail} label="Correo Electrónico" value={user.email} />}
            <InfoItem
              icon={Calendar}
              label="Fecha de Registro"
              value={format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información del Perfil de Estudiante */}
      {studentProfile && (
        <Card className="border-2">
          <CardHeader className="bg-linear-to-r from-green-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Perfil de Estudiante
            </CardTitle>
            <CardDescription>
              Información académica y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {studentProfile.birthDate && (
                <InfoItem
                  icon={Calendar}
                  label="Fecha de Nacimiento"
                  value={format(new Date(studentProfile.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                />
              )}
              {studentProfile.address && <InfoItem icon={MapPin} label="Dirección" value={studentProfile.address} />}
              {studentProfile.phone && <InfoItem icon={Phone} label="Teléfono" value={studentProfile.phone} />}
              {studentProfile.guardianName && <InfoItem icon={Users} label="Nombre del Tutor" value={studentProfile.guardianName} />}
              {studentProfile.guardianPhone && <InfoItem icon={Phone} label="Teléfono del Tutor" value={studentProfile.guardianPhone} />}

              {!studentProfile.birthDate && !studentProfile.address && !studentProfile.phone &&
               !studentProfile.guardianName && !studentProfile.guardianPhone && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay información adicional del perfil
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del Perfil de Profesor */}
      {teacherProfile && (
        <Card className="border-2">
          <CardHeader className="bg-linear-to-r from-blue-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Perfil de Profesor
            </CardTitle>
            <CardDescription>
              Información profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {teacherProfile.specialization && (
                <InfoItem icon={User} label="Especialización" value={teacherProfile.specialization} />
              )}
              {teacherProfile.hireDate && (
                <InfoItem
                  icon={Calendar}
                  label="Fecha de Contratación"
                  value={format(new Date(teacherProfile.hireDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                />
              )}

              {!teacherProfile.specialization && !teacherProfile.hireDate && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay información adicional del perfil
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
