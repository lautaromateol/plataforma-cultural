"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVerifyEmail } from "@/features/auth/api/use-verify-email";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";

export default function VerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { data, verifyEmail, isVerifying, error } = useVerifyEmail();

  const hasRun = useRef(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!hasRun.current) {
      hasRun.current = true;
      verifyEmail({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      {isVerifying ? (
        <div className="flex flex-col items-center justify-center gap-y-3">
          <div className="animate-spin transition-all">
            <Loader2Icon className="size-16" />
          </div>
          <p className="text-center font-medium">
            Verificando correo electrónico...
          </p>
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{error ? error.message : data?.message}</CardTitle>
            {data && (
              <CardDescription>
                Inicia sesión utilizando tu correo o tu número de DNI.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}>
                Inicia sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
