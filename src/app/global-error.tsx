"use client";

// Só entra em ação se o próprio layout raiz quebrar (bem mais raro que
// o error.tsx normal) — por isso precisa desenhar <html>/<body> do
// zero, sem poder contar com o RootLayout.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "-apple-system, sans-serif",
          background: "#F7FAFC",
          color: "#2D3748",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1A365D" }}>
          Algo deu errado
        </h1>
        <p style={{ maxWidth: 320, fontSize: 14, color: "#718096" }}>
          Não conseguimos carregar o VanTástica agora. Tenta recarregar a
          página.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: 9999,
            background: "#1A365D",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
