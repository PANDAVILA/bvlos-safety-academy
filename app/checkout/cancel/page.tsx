import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancel() {
  return (
    <div className="chart-bg-light flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-20">
      <div className="max-w-md border border-navy-900/10 bg-white p-10 text-center">
        <XCircle size={40} className="mx-auto text-navy-900/40" />
        <h1 className="mt-6 font-display text-2xl text-navy-900">Pago cancelado</h1>
        <p className="mt-3 text-navy-900/60">No se ha realizado ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>
        <Link href="/cursos" className="mt-8 inline-block bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
