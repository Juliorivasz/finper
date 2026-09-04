"use client";

import { useState, useEffect } from "react";

const PHRASES = [
  "Organizando tus finanzas...",
  "Calculando tus gastos...",
  "Preparando tu resumen...",
  "Analizando tus movimientos...",
  "Consolidando tu progreso...",
  "Ajustando las métricas...",
  "Cargando Finper..."
];

export function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    // Escoger una frase aleatoria inicial
    const initialIndex = Math.floor(Math.random() * (PHRASES.length - 1));
    setPhraseIndex(initialIndex);

    // Cambiar frase cada 2.5 segundos
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 w-full animate-in fade-in duration-500">
      {/* Ícono de Dólar con animación Shimmer */}
      <div className="relative overflow-hidden w-24 h-24 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/30 shadow-2xl">
        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white relative z-10">
          $
        </span>
        {/* Haz de luz (Shimmer effect) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer z-20 pointer-events-none" />
      </div>
      
      {/* Frase Dinámica */}
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground font-medium text-lg animate-pulse">
          {PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  );
}
