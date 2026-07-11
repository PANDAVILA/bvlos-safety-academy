import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="chart-bg-light flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-20">
      <div className="max-w-md border border-navy-900/10 bg-white p-10 text-center">
        <CheckCircle2 size={40} className="mx-auto text-gold-600" />
        <h1 className="mt-6 font-display text-2xl text-navy-900">Pago completado</h1>
        <p className="mt-3 text-navy-900/60">
          Gracias por tu compra. Ya puedes acceder a tu contenido desde tu panel.
        </p>
        <Link href="/panel" className="mt-8 inline-block bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
          Ir a mi panel
        </Link>
      </div>
    </div>
  );
}
