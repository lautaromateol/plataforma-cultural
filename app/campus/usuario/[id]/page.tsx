"use client";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useGetUser } from "@/features/auth/api/use-get-user";
import { useGetStudentProfile } from "@/features/user-profile/api/use-get-student-profile";
import { UserProfileData } from "@/features/user-profile/components/user-profile-data";
import { Button } from "@/components/ui/button";
import { UserProfileForm } from "@/features/user-profile/components/user-profile-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserPage() {
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);

  const { profile, isPending, error } = useGetStudentProfile(
    params.id as string
  );

  const { user } = useGetUser();

  if (isPending) {
    return (
      <section className="min-h-screen container space-y-6 py-4">
        <header className="space-y-4">
          <Skeleton className="w-1/3 h-8 rounded-md" />
          <div className="flex items-center gap-x-2">
            <Skeleton className="rounded-full p-14 bg-slate-100 border" />
            <Skeleton className="w-48 h-10 rounded-md" />
          </div>
        </header>
        <Skeleton className="w-full h-64 rounded-md" />
      </section>
    )
  }

  if (error || !profile) {
    return notFound();
  }

  const isAuthorized = profile.id === user?.id;

  return (
    <section className="min-h-screen container space-y-6 py-4">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-2xl">Perfil del {profile.role === "STUDENT" ? "estudiante" : "profesor"}</h3>
            <p className="text-lg font-light">
              Información personal y datos de contacto
            </p>
          </div>
          {isAuthorized && (
            <Button variant={isEditMode ? "destructive" : "outline"} onClick={() => setIsEditMode((curr) => !curr)}>
              {isEditMode ? "Cancelar" : "Editar perfil"}
              {isEditMode ? <X className="ml-2 size-4" /> : <Pencil className="ml-2 size-4" />}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-x-2">
          <div className="rounded-full p-14 bg-slate-100 border" />
          <h2 className="text-4xl font-bold">{profile.name}</h2>
        </div>
      </header>
      {isEditMode ? (
        <UserProfileForm userId={params.id as string} profile={profile} setIsEditMode={setIsEditMode}/>
      ) : (
        <UserProfileData profile={profile} />
      )}
    </section>
  );
}