"use client";

// Global error boundary required to prevent Next.js 16 from auto-generating
// the /_global-error page with Turbopack, which triggers a workStore invariant bug.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#050505",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>
          Algo salió mal
        </h2>
        <p style={{ color: "#a1a1aa", fontSize: "14px" }}>
          {error.message || "Ocurrió un error inesperado."}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "8px",
            padding: "10px 24px",
            borderRadius: "8px",
            background: "#fff",
            color: "#000",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
