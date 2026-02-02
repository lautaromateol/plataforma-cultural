"use client";
import { Button } from "@/components/ui/button";
import { useGetUser } from "@/features/auth/api/use-get-user";
import { useGetStudentProfile } from "@/features/user-profile/api/use-get-student-profile";
import { Pencil } from "lucide-react";
import { notFound, useParams } from "next/navigation";

export default function UserPage() {
  const params = useParams();

  const { profile, isPending, error } = useGetStudentProfile(
    params.id as string
  );

  const { user } = useGetUser();

  if (isPending) {
    return <>Loading</>;
  }

  if (error || !profile) {
    return notFound();
  }

  const isEditMode = profile.id === user?.id;

  return (
    <section className="min-h-screen container">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-2xl">Perfil del estudiante</h3>
            <p className="text-lg font-light">
              Información personal y datos de contacto
            </p>
          </div>
          {isEditMode ?? (
            <Button>
              Editar perfil
              <Pencil className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-x-2">
          <div className="rounded-full p-14 border" />
          <h2 className="text-4xl font-bold">{profile.name}</h2>
        </div>
      </header>
    </section>
  );
}
