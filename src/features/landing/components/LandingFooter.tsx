import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50">
            <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
              $
            </span>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">
            Finper<span className="text-gray-500">.</span>
          </span>
        </Link>

        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Finper. Todos los derechos reservados.
        </p>

        <nav className="flex gap-6">
          <Link className="text-xs text-gray-500 hover:text-white transition-colors" href="#">
            Términos
          </Link>
          <Link className="text-xs text-gray-500 hover:text-white transition-colors" href="#">
            Privacidad
          </Link>
          <Link className="text-xs text-gray-500 hover:text-white transition-colors" href="/login">
            Iniciar Sesión
          </Link>
        </nav>
      </div>
    </footer>
  );
}
