import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, CreditCard, Wallet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white overflow-x-hidden">

      {/* ===================== NAVBAR ===================== */}
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

      {/* ===================== HERO ===================== */}
      <main className="flex-1">
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
            {/* Gradient to blend image smoothly into the dark section */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
            
            {/* Subtle Glows */}
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

        {/* ===================== FEATURES ===================== */}
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                Todo lo que necesitas
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Finanzas personales sin complicaciones
              </h2>
            </div>

            {/* Feature cards grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "Registro ultrarrápido",
                  desc: "Añade un gasto en segundos. Sin formularios tediosos, sin pérdida de tiempo.",
                  accent: "from-yellow-500/20 to-orange-500/10",
                  iconBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                },
                {
                  icon: <BarChart3 className="w-5 h-5" />,
                  title: "Dashboard inteligente",
                  desc: "Gráficos claros que te muestran exactamente a dónde va tu dinero cada mes.",
                  accent: "from-blue-500/20 to-cyan-500/10",
                  iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                },
                {
                  icon: <CreditCard className="w-5 h-5" />,
                  title: "Control de deudas",
                  desc: "Administra lo que debes y lo que te deben con abonos parciales y fechas de vencimiento.",
                  accent: "from-red-500/20 to-pink-500/10",
                  iconBg: "bg-red-500/10 text-red-400 border-red-500/20",
                },
                {
                  icon: <TrendingUp className="w-5 h-5" />,
                  title: "Progreso visual",
                  desc: "Observa cómo evolucionan tus finanzas con métricas claras y actualizadas en tiempo real.",
                  accent: "from-green-500/20 to-emerald-500/10",
                  iconBg: "bg-green-500/10 text-green-400 border-green-500/20",
                },
                {
                  icon: <Wallet className="w-5 h-5" />,
                  title: "Por categorías",
                  desc: "Organiza tus gastos en categorías personalizadas y descubre dónde puedes ahorrar más.",
                  accent: "from-purple-500/20 to-violet-500/10",
                  iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Privado y seguro",
                  desc: "Tus datos son solo tuyos. Autenticación segura con Google y datos cifrados en Supabase.",
                  accent: "from-gray-500/20 to-slate-500/10",
                  iconBg: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className={`relative rounded-2xl border border-white/8 bg-gradient-to-br ${f.accent} p-6 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 group overflow-hidden`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${f.iconBg}`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA FINAL ===================== */}
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
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-bold text-base rounded-xl px-10 gap-2 h-12"
                >
                  Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
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
    </div>
  );
}
