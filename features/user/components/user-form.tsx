"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserSchema, updateUserSchema } from "../schemas";
import { useCreateUser } from "../api/use-create-user";
import { useUpdateUser } from "../api/use-update-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserFormProps {
  initialData?: {
    id: string;
    dni: string;
    email?: string | null;
    name: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
  };
  onSuccess?: () => void;
}

type CreateUserData = z.infer<typeof createUserSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const isEdit = !!initialData;
  const [showPassword, setShowPassword] = useState(false);

  const schema = isEdit ? updateUserSchema : createUserSchema;
  
  const form = useForm<CreateUserData | UpdateUserData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dni: initialData?.dni ?? "",
      email: initialData?.email ?? "",
      password: "",
      name: initialData?.name ?? "",
      role: initialData?.role ?? "STUDENT",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        dni: initialData.dni ?? "",
        email: initialData.email ?? "",
        password: "",
        name: initialData.name ?? "",
        role: initialData.role ?? "STUDENT",
      });
    }
  }, [initialData, form]);

  const { createUserAsync, isCreatingUser } = useCreateUser();
  const { updateUserAsync, isUpdatingUser } = useUpdateUser();

  async function onSubmit(data: CreateUserData | UpdateUserData) {
    try {
      if (isEdit && initialData) {
        const updateData: any = {
          dni: data.dni,
          email: data.email || undefined,
          name: data.name,
          role: data.role,
        };
        
        // Solo incluir password si no está vacío
        if (data.password && data.password.trim().length > 0) {
          updateData.password = data.password;
        }
        
        await updateUserAsync({ id: initialData.id, data: updateData });
        toast.success("Usuario actualizado exitosamente");
      } else {
        await createUserAsync(data as CreateUserData);
        toast.success("Usuario creado exitosamente");
      }
      form.reset();
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : isEdit
          ? "Error al actualizar el usuario"
          : "Error al crear el usuario";
      toast.error(errorMessage);
      console.error("Error submitting form:", error);
    }
  }

  const isPending = isCreatingUser || isUpdatingUser;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Usuario" : "Crear Usuario"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifica la información del usuario"
            : "Completa los datos para crear un nuevo usuario en el sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Documento Nacional de Identidad"
                      disabled={isPending || isEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEdit
                      ? "El DNI no puede ser modificado"
                      : "Debe ser único en el sistema"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Juan Pérez"
                      disabled={isPending}
                      {...field}
                    />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="usuario@ejemplo.com (opcional)"
                      disabled={isPending}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    El email es opcional pero debe ser único si se proporciona
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol *</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isPending}
                      placeholder="Selecciona un rol"
                    >
                      <SelectItem value="STUDENT">Estudiante</SelectItem>
                      <SelectItem value="TEACHER">Profesor</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? "Nueva Contraseña" : "Contraseña *"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          isEdit
                            ? "Dejar vacío para mantener la contraseña actual"
                            : "Mínimo 6 caracteres"
                        }
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {isEdit
                      ? "Solo completa este campo si deseas cambiar la contraseña"
                      : "La contraseña debe tener al menos 6 caracteres"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>{isEdit ? "Actualizar" : "Crear"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}