import Link from "next/link";
import { XCircle, RefreshCw, Home, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnrollmentErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Error en el pago
          </h1>
          <p className="text-gray-600">
            Hubo un problema al procesar tu pago. No se realizó ningún cargo a
            tu cuenta.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-left">
          <p className="text-sm text-gray-600 mb-3">
            Esto puede deberse a:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Fondos insuficientes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Tarjeta rechazada por el banco
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Datos de la tarjeta incorrectos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Problema temporal de conexión
            </li>
          </ul>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 text-left">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">
                ¿Necesitás ayuda?
              </p>
              <p className="text-sm text-gray-600">
                Contactanos al +54 379 4123456 o acercate a nuestra sede en La
                Rioja 1145.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Link href="/">
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar nuevamente
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
