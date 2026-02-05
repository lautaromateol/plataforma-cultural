import Link from "next/link";
import { CheckCircle2, Mail, ExternalLink, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnrollmentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Inscripción exitosa!
          </h1>
          <p className="text-gray-600">
            Tu pago ha sido procesado correctamente y ya sos parte del Centro
            Cultural Correntino.
          </p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-6 space-y-4 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">
                Revisá tu correo electrónico
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Te enviamos tus credenciales de acceso al campus virtual junto
                con instrucciones para comenzar.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Si no encontrás el correo en tu bandeja
            de entrada, revisá la carpeta de spam o correo no deseado.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Link href="/campus">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ir al campus virtual
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
