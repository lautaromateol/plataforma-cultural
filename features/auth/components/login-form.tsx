"use client";
import z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, AlertCircle, IdCard } from "lucide-react";
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
import { signInSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { CreateMailForm } from "./create-mail-form";
import { useResendMail } from "../api/use-resend-mail";

export function LoginForm() {
  const form = useForm<z.infer<typeof signInSchema>>({
    defaultValues: {
      dni: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [credentials, setCredentials] = useState<{
    name: undefined | string;
    dni: undefined | string;
    password: undefined | string;
  }>({
    name: undefined,
    dni: undefined,
    password: undefined,
  });
  const [loginType, setLoginType] = useState<"email" | "dni">("email");
  const { login, error, isLogginIn } = useLogin();
  const { resendMail, isResendingMail } = useResendMail();

  async function onSubmit({
    email,
    password,
    dni,
  }: z.infer<typeof signInSchema>) {
    login(
      { email, password, dni },
      {
        onSuccess: (data: any) => {
          if (data.redirect) {
            setCredentials({ ...data, password });
            setShowCreate(data.redirect);
          }
        },
        onError: (error: any) => {
          console.log({ error });
          setErrorMessage(
            error ? (error as any).data?.message || error.message : ""
          );
        },
      }
    );
  }

  const isPending = isLogginIn || isResendingMail;

  return (
    <>
      {showCreate ? (
        <CreateMailForm credentials={credentials} />
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-5 w-full"
          >
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                Tipo de Acceso
              </Label>
              <div className="flex gap-2 sm:gap-3">
                <label
                  className="flex-1 flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 border-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    borderColor:
                      loginType === "email"
                        ? "rgb(37, 99, 235)"
                        : "rgb(203, 213, 225)",
                    backgroundColor:
                      loginType === "email"
                        ? "rgb(239, 246, 255)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="loginType"
                    value="email"
                    checked={loginType === "email"}
                    onChange={(e) =>
                      setLoginType(e.target.value as "email" | "dni")
                    }
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-blue-600"
                    disabled={isPending}
                  />
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    Email
                  </span>
                </label>
                <label
                  className="flex-1 flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 border-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    borderColor:
                      loginType === "dni"
                        ? "rgb(37, 99, 235)"
                        : "rgb(203, 213, 225)",
                    backgroundColor:
                      loginType === "dni"
                        ? "rgb(239, 246, 255)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="loginType"
                    value="dni"
                    checked={loginType === "dni"}
                    onChange={(e) =>
                      setLoginType(e.target.value as "email" | "dni")
                    }
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-blue-600"
                    disabled={isPending}
                  />
                  <IdCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    DNI
                  </span>
                </label>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-6 sm:space-y-8">
              {error && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 flex-1">
                      {errorMessage}
                    </p>
                  </div>
                  {(error as any).status === 403 && (
                    <p
                      onClick={() => {
                        resendMail({
                          dni: form.getValues().dni,
                          email: form.getValues().email,
                        })
                      }
                      }
                      className="text-xs sm:text-sm text-red-700 dark:text-red-300 underline cursor-pointer font-bold self-start sm:self-auto"
                    >
                      Reenviar
                    </p>
                  )}
                </div>
              )}

              {loginType === "email" ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Correo Electrónico
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />

                          <FormControl>
                            <Input
                              id="email"
                              placeholder="tu.email@ejemplo.com"
                              className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="dni"
                          className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <span className="hidden sm:inline">DNI (Documento de Identidad Nacional)</span>
                          <span className="sm:hidden">DNI</span>
                        </Label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />

                          <FormControl>
                            <Input
                              id="dni"
                              placeholder="Ingresa tu DNI"
                              className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium"
                      >
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <FormControl>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 text-sm sm:text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 disabled:opacity-50 text-base sm:text-lg"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            defaultChecked
            disabled={isLoading}
            className="w-4 h-4 rounded border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 cursor-pointer accent-blue-600"
          />
          <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            Recuérdame en este dispositivo
          </label>
        </div> */}

              <Button
                type="submit"
                className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isPending}
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
