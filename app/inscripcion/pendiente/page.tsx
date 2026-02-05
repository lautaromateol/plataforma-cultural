import Link from "next/link";
import { Clock, Mail, Home, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnrollmentPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Pago en proceso
          </h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado. Esto puede demorar unos minutos
            dependiendo del método de pago seleccionado.
          </p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-6 space-y-4 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">
                Te notificaremos por email
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Una vez que el pago sea confirmado, recibirás un correo con tus
                credenciales de acceso al campus virtual.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <p className="text-sm text-gray-600">
            <strong>Nota:</strong> Si elegiste pagar en efectivo (Rapipago, Pago
            Fácil, etc.), recordá que tenés un plazo limitado para realizar el
            pago antes de que expire.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">
                ¿Tenés dudas sobre tu pago?
              </p>
              <p className="text-sm text-gray-600">
                Contactanos al +54 379 4123456
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" asChild className="w-full">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
