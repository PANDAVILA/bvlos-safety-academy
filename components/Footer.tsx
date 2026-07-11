import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="chart-bg border-t border-gold-500/20 text-white">
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image src="/brand/logo.png" alt="BVLOS Safety Academy" width={180} height={50} className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Formación, estándares y consultoría para operaciones BVLOS seguras en todo el mundo.
            </p>
            <p className="eyebrow mt-6 text-gold-400">Knowledge · Standards · Safety</p>
          </div>

          <div>
            <p className="eyebrow text-white/50">Academia</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/cursos" className="hover:text-gold-400">Catálogo de cursos</Link></li>
              <li><Link href="/panel" className="hover:text-gold-400">Mi panel</Link></li>
              <li><Link href="/tienda" className="hover:text-gold-400">Ebooks y plantillas</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Contenido</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/noticias" className="hover:text-gold-400">Noticias</Link></li>
              <li><Link href="/informes" className="hover:text-gold-400">Informes técnicos</Link></li>
              <li><Link href="/aerosafety-case" className="hover:text-gold-400">AeroSafety Case</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Consultoría</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/consultoria" className="hover:text-gold-400">Servicios</Link></li>
              <li><Link href="/consultoria#contacto" className="hover:text-gold-400">Solicitar propuesta</Link></li>
              <li><Link href="/contacto" className="hover:text-gold-400">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 lg:flex-row lg:items-center">
          <p>© {new Date().getFullYear()} BVLOS Safety Academy. Todos los derechos reservados.</p>
          <p className="coord">39.4699° N · 0.3763° W — HQ OPS</p>
        </div>
      </div>
    </footer>
  );
}
