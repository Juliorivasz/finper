import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-14 text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* Logo big */}
          <div className="relative w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50 shadow-xl">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
              $
            </span>
          </div>

          <h2 className="relative text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Empieza hoy, sin costo.
          </h2>
          <p className="relative text-gray-400 text-base sm:text-lg mb-8 max-w-md mx-auto">
            Únete y toma el control de tus finanzas personales en minutos.
          </p>

          <Link href="/login" className="relative inline-block w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-bold text-base rounded-xl px-10 gap-2 h-12 cursor-pointer"
            >
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
