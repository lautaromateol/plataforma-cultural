"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createMailSchema } from "../schemas";
import { useCreateMail } from "../api/use-create-mail";

type Credentials = {
  name: undefined | string;
  dni: undefined | string;
  password: undefined | string;
};

interface CreateMailFormInterface {
  credentials: Credentials;
}

export function CreateMailForm({
  credentials: { name, dni, password },
}: CreateMailFormInterface) {
  const form = useForm<z.infer<typeof createMailSchema>>({
    defaultValues: {
      email: "",
      dni,
      password,
    },
    resolver: zodResolver(createMailSchema),
  });

  const { data, createMail, error, isCreatingMail } = useCreateMail();

  async function onSubmit({
    email,
    password,
    dni,
  }: z.infer<typeof createMailSchema>) {
    console.log("hi");
    createMail({ email, password, dni });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">
          Asocia un correo electrónico a tu cuenta, {name?.split(" ")[0]}
        </Label>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-8">
          {data && (
            <div className="flex gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                {data.message}
              </p>
            </div>
          )}

          {error && (
            <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-700 dark:text-slate-300 font-medium"
                  >
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <FormControl>
                      <Input
                        id="email"
                        placeholder="tu.email@ejemplo.com"
                        className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        disabled={isCreatingMail || !!data}
                        {...field}
                      />
                    </FormControl>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {!data && (
            <Button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={isCreatingMail}
            >
              Confirmar correo
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
