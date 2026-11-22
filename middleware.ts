import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BYPASS_COOKIE = 'bsa-preview'

/**
 * Modo mantenimiento.
 *
 * Se activa poniendo MAINTENANCE_MODE=true en las variables de Railway.
 * Con MAINTENANCE_MODE ausente o en cualquier otro valor, la web funciona normal.
 *
 * Para verla tú mismo mientras está activo:
 *   https://bvlossafetyacademy.com/?preview=TU_CLAVE
 * (la clave es el valor de MAINTENANCE_BYPASS_KEY)
 * Queda guardada en una cookie durante 7 dias.
 */
export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== 'true') {
    return NextResponse.next()
  }

  const { pathname, searchParams } = request.nextUrl

  // Rutas que siguen accesibles: el propio aviso, el admin y la autenticacion.
  // Asi puedes seguir cargando cursos y contenido mientras el publico ve el aviso.
  const alwaysAllowed = [
    '/mantenimiento',
    '/admin',
    '/login',
    '/api/auth',
  ]

  if (alwaysAllowed.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const bypassKey = process.env.MAINTENANCE_BYPASS_KEY

  // Primera visita con la clave en la URL: guardamos cookie y limpiamos la URL.
  if (bypassKey && searchParams.get('preview') === bypassKey) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('preview')

    const response = NextResponse.redirect(url)
    response.cookies.set(BYPASS_COOKIE, bypassKey, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  }

  // Visitas siguientes: la cookie basta.
  if (bypassKey && request.cookies.get(BYPASS_COOKIE)?.value === bypassKey) {
    return NextResponse.next()
  }

  // Todo lo demas ve el aviso, manteniendo la URL original.
  const url = request.nextUrl.clone()
  url.pathname = '/mantenimiento'
  url.search = ''
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Excluye assets estaticos y archivos subidos para que el aviso
     * conserve su tipografia, logo y fondo.
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$).*)',
  ],
}
