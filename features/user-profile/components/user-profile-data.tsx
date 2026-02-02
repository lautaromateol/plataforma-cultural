import { Cake, IdCard, Mail, Phone, User, X } from "lucide-react";
import { cloneElement, JSX } from "react";
import { StudentProfileData } from "../api/use-get-student-profile";

export function UserProfileData({ profile }: {
    profile: StudentProfileData
}) {
    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {"Información personal"}
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                    label="Nombre completo"
                    value={profile.name}
                    icon={<User />}
                />
                <InfoCard
                    label="Correo electrónico"
                    value={profile.email || "No proporcionado"}
                    icon={<Mail />}
                />
                <InfoCard
                    label="DNI"
                    value={profile.dni}
                    icon={<IdCard />}
                />
                <InfoCard
                    label="Número de teléfono"
                    value={profile.phone || "No proporcionado"}
                    icon={<Phone />}
                />
                <InfoCard
                    label="Fecha de nacimiento"
                    value={profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('es-ES') : "No proporcionado"}
                    icon={<Cake />}
                />
            </div>
            {
                profile.role === "STUDENT" && (
                    <>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {"Información de contacto"}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard
                                label="Nombre del tutor"
                                value={profile.guardianName || "No proporcionado"}
                                icon={<User />}
                            />
                            <InfoCard
                                label="Telefono del tutor"
                                value={profile.guardianPhone || "No proporcionado"}
                                icon={<Phone />}
                            />
                        </div>
                    </>
                )
            }
        </>
    )
}

interface InfoCardProps {
    label: string;
    value: string;
    icon: JSX.Element;
}

function InfoCard({ label, value, icon }: InfoCardProps) {
    return (
        <div className="rounded-lg p-3 flex items-center gap-x-4 bg-slate-100 dark:bg-slate-800">
            <div className="rounded-full p-3 bg-slate-200 dark:bg-slate-700">
                {cloneElement(icon, { className: "size-5 text-primary" })}
            </div>
            <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    )
}