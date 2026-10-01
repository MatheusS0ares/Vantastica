const WORDMARK = "VanTástica";
const ACCENT_LETTER_INDEX = 4; // o "á"

/**
 * Tela cheia com a logo animada da VanTástica, mostrada enquanto o login
 * está em andamento (a action de auth normalmente demora alguns segundos).
 * Fica montada só enquanto o form está pending — ver LoginSubmitButton.
 *
 * Geometria inspirada na logo oficial: estrada em V terminando numa seta
 * que aponta pro pino de destino, sem o rosto que tinha no rascunho
 * inicial (a logo de verdade não tem).
 */
export function LoadingSplash() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-navy"
    >
      <span className="sr-only">Entrando…</span>

      <div aria-hidden className="vls-glow" />

      <svg
        aria-hidden
        viewBox="0 0 380 280"
        className="vls-logo h-40 w-auto sm:h-48"
      >
        <defs>
          <linearGradient id="vlsRoadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a365d" />
            <stop offset="100%" stopColor="#2b6cb0" />
          </linearGradient>
          <linearGradient id="vlsPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        <path
          className="vls-road-base"
          d="M 88 62 C 118 142, 152 212, 190 226 C 218 212, 238 178, 256 128"
          fill="none"
          stroke="url(#vlsRoadGrad)"
          strokeWidth={34}
          strokeLinecap="round"
        />
        <path
          className="vls-road-dash"
          d="M 88 62 C 118 142, 152 212, 190 226 C 218 212, 238 178, 256 128"
          fill="none"
          stroke="#22C55E"
          strokeWidth={4}
          strokeDasharray="11 11"
          strokeLinecap="round"
        />

        {/* Grupo externo só posiciona (atributo transform estático); a
            animação CSS entra no grupo de dentro — misturar os dois no
            mesmo <g> faz o transform da animação substituir por completo
            o translate/rotate do atributo. */}
        <g transform="translate(272, 96) rotate(24)">
          <g className="vls-arrow">
            <path
              d="M 0 -22 L 16 4 L 6 4 L 6 22 L -6 22 L -6 4 L -16 4 Z"
              fill="#2b6cb0"
            />
          </g>
        </g>

        <g transform="translate(300, 54)">
          <g className="vls-pin">
            <g className="vls-pin-wiggle">
              <path
                d="M 0 -46 C -22 -46 -38 -28 -38 -6 C -38 24 0 54 0 54 C 0 54 38 24 38 -6 C 38 -28 22 -46 0 -46 Z"
                fill="url(#vlsPinGrad)"
              />
              <circle cx="0" cy="-4" r="16" fill="#1a365d" />
            </g>
          </g>
        </g>

        <g transform="translate(300, 54)">
          <circle className="vls-confetti-piece" style={{ "--tx": "-38px", "--ty": "-30px", animationDelay: "1.5s" } as React.CSSProperties} r={4} fill="#FACC15" />
          <rect className="vls-confetti-piece" style={{ "--tx": "34px", "--ty": "-36px", "--tr": "140deg", animationDelay: "1.56s" } as React.CSSProperties} x={-3} y={-3} width={6} height={6} fill="#38BDF8" />
          <circle className="vls-confetti-piece" style={{ "--tx": "-8px", "--ty": "-52px", animationDelay: "1.64s" } as React.CSSProperties} r={3.5} fill="#4ADE80" />
          <rect className="vls-confetti-piece" style={{ "--tx": "44px", "--ty": "4px", "--tr": "-100deg", animationDelay: "1.46s" } as React.CSSProperties} x={-3} y={-3} width={6} height={6} fill="#FACC15" />
        </g>
      </svg>

      <div className="vls-wordmark-wrap relative pt-3">
        <p aria-hidden className="vls-wordmark flex text-3xl font-black text-white sm:text-4xl">
          {WORDMARK.split("").map((letter, i) => (
            <span
              key={i}
              className="vls-letter relative inline-block"
              style={{ animationDelay: `${0.35 + i * 0.05}s` }}
            >
              {letter}
              {i === ACCENT_LETTER_INDEX && (
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="vls-accent-mark absolute -top-3 left-1/2 h-3 w-3"
                  style={{ animationDelay: `${0.35 + i * 0.05 + 0.2}s` }}
                >
                  <path
                    d="M 3 13 L 10 20 L 21 4"
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          ))}
        </p>
        <span aria-hidden className="vls-shimmer pointer-events-none absolute inset-0" />
      </div>

      <p className="vls-tagline text-sm font-medium text-sky-200">
        Preparando o seu painel…
      </p>

      <div className="vls-dots flex gap-2">
        <span className="vls-dot h-2.5 w-2.5 rounded-full bg-sky-400" />
        <span className="vls-dot h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="vls-dot h-2.5 w-2.5 rounded-full bg-blue-400" />
      </div>
    </div>
  );
}
