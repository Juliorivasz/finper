import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50 shadow-lg group-hover:border-gray-400/70 transition-colors">
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
              $
            </span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Finper<span className="text-gray-500">.</span>
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:inline-flex"
          >
            Iniciar Sesión
          </Link>
          <Link href="/login">
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-200 font-semibold text-sm rounded-lg px-4"
            >
              Comenzar Gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
