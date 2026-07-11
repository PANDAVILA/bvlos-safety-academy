"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronRight } from "lucide-react";

const nav = [
  { href: "/cursos", label: "Cursos" },
  { href: "/noticias", label: "Noticias" },
  { href: "/informes", label: "Informes" },
  { href: "/consultoria", label: "Consultoría" },
  { href: "/tienda", label: "Recursos" },
  { href: "/aerosafety-case", label: "AeroSafety Case" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image src="/brand/logo.png" alt="BVLOS Safety Academy" width={160} height={44} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="eyebrow text-navy-900/70 transition hover:text-gold-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <>
              <Link href="/panel" className="eyebrow text-navy-900/70 hover:text-gold-600">
                Mi panel
              </Link>
              <button
                onClick={() => signOut()}
                className="eyebrow rounded-none border border-navy-900/20 px-4 py-2 text-navy-900 hover:border-navy-900"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="eyebrow text-navy-900/70 hover:text-gold-600">
                Iniciar sesión
              </Link>
              <Link
                href="/cursos"
                className="eyebrow group flex items-center gap-1 border border-navy-900 bg-navy-900 px-4 py-2 text-white transition hover:bg-navy-800"
              >
                Explorar cursos
                <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menú">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-900/10 bg-paper px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="eyebrow" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-navy-900/10 pt-4">
              {session ? (
                <>
                  <Link href="/panel" className="eyebrow" onClick={() => setOpen(false)}>Mi panel</Link>
                  <button onClick={() => signOut()} className="eyebrow text-left">Salir</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="eyebrow" onClick={() => setOpen(false)}>Iniciar sesión</Link>
                  <Link href="/registro" className="eyebrow" onClick={() => setOpen(false)}>Crear cuenta</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
