import { Zap, BarChart3, CreditCard, TrendingUp, Wallet, Shield } from "lucide-react";

const FEATURES = [
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
];

export function LandingFeatures() {
  return (
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
          {FEATURES.map((f) => (
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
  );
}
