import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center overflow-hidden">
      {/* Background image & glow effects */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
        {/* Diagonal Image Background */}
        <div 
          className="absolute inset-0 w-full h-[110%] -top-[5%] bg-cover bg-center opacity-25 md:opacity-30"
          style={{ 
            backgroundImage: "url('/hero-bg.jpg')",
            clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" 
          }}
        />
        {/* Gradient blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-gray-500/10 blur-3xl" />
      </div>

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium mb-8 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Gratis · Sin tarjeta de crédito
      </div>

      {/* Headline */}
      <h1 className="relative max-w-4xl mx-auto text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
        Tu dinero,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400">
          bajo control.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="relative max-w-xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed mb-10">
        Registra gastos, gestiona deudas y visualiza tu progreso financiero.
        Simple, seguro y diseñado para que realmente lo uses.
      </p>

      {/* CTA Buttons */}
      <div className="relative flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs sm:max-w-none">
        <Link href="/login" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-bold text-base rounded-xl px-8 gap-2 h-12"
          >
            Empezar Ahora <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="#features" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-medium text-base rounded-xl px-8 h-12 backdrop-blur-sm"
          >
            Ver características
          </Button>
        </Link>
      </div>

      {/* Stats strip */}
      <div className="relative mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-md sm:max-w-lg mx-auto">
        {[
          { label: "Gratis", value: "100%" },
          { label: "Seguro", value: "🔒" },
          { label: "Instalable", value: "📱" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
