const WORDMARK = "VanTástica";

/**
 * Tela cheia com a logo animada da VanTástica, mostrada enquanto o login
 * está em andamento (a action de auth normalmente demora alguns segundos).
 * Fica montada só enquanto o form está pending — ver LoginSubmitButton.
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
          <linearGradient id="vlsRoadBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#13284f" />
            <stop offset="100%" stopColor="#0B1B3A" />
          </linearGradient>
          <linearGradient id="vlsArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2E5BFF" />
          </linearGradient>
          <linearGradient id="vlsPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        <path
          className="vls-road-base"
          d="M 75 55 C 105 130, 140 215, 175 228 C 192 234, 212 215, 238 150 L 276 56"
          fill="none"
          stroke="url(#vlsRoadBase)"
          strokeWidth={38}
          strokeLinecap="round"
        />
        <path
          className="vls-road-edge"
          d="M 59 50 C 90 128, 126 222, 168 244 C 188 252, 218 238, 252 148 L 292 50"
          fill="none"
          stroke="#2E5BFF"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          className="vls-road-dash"
          d="M 75 55 C 105 130, 140 215, 175 228 C 192 234, 212 215, 238 150 L 275 58"
          fill="none"
          stroke="#FACC15"
          strokeWidth={4}
          strokeDasharray="12 12"
          strokeLinecap="round"
        />

        {/* Grupo externo só posiciona (atributo transform estático); a
            animação CSS entra no grupo de dentro — misturar os dois no
            mesmo <g> faz o transform da animação substituir por completo
            o translate/rotate do atributo. */}
        <g transform="translate(266, 28) rotate(145)">
          <g className="vls-arrow">
            <path
              d="M 0 -20 L 15 3 L 6 3 L 6 20 L -6 20 L -6 3 L -15 3 Z"
              fill="url(#vlsArrowGrad)"
            />
          </g>
        </g>

        <g className="vls-pin">
          <g className="vls-pin-wiggle">
            <path
              d="M 175 150 C 150 150 132 170 132 195 C 132 228 175 260 175 260 C 175 260 218 228 218 195 C 218 170 200 150 175 150 Z"
              fill="url(#vlsPinGrad)"
            />
            <circle cx="175" cy="196" r="20" fill="#0B1B3A" />
            <circle cx="168" cy="192" r="4" fill="#ffffff" />
            <circle cx="182" cy="192" r="4" fill="#ffffff" />
            <path
              d="M 165 202 Q 175 210 185 202"
              stroke="#ffffff"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>

        <g transform="translate(175, 195)">
          <circle className="vls-confetti-piece" style={{ "--tx": "-40px", "--ty": "-54px", animationDelay: "1.5s" } as React.CSSProperties} r={4} fill="#FACC15" />
          <rect className="vls-confetti-piece" style={{ "--tx": "36px", "--ty": "-62px", "--tr": "140deg", animationDelay: "1.56s" } as React.CSSProperties} x={-3} y={-3} width={6} height={6} fill="#38BDF8" />
          <circle className="vls-confetti-piece" style={{ "--tx": "-12px", "--ty": "-72px", animationDelay: "1.64s" } as React.CSSProperties} r={3.5} fill="#4ADE80" />
          <rect className="vls-confetti-piece" style={{ "--tx": "48px", "--ty": "-18px", "--tr": "-100deg", animationDelay: "1.46s" } as React.CSSProperties} x={-3} y={-3} width={6} height={6} fill="#FACC15" />
        </g>
      </svg>

      <div className="vls-wordmark-wrap relative">
        <p aria-hidden className="vls-wordmark flex text-3xl font-black text-white sm:text-4xl">
          {WORDMARK.split("").map((letter, i) => (
            <span
              key={i}
              className="vls-letter inline-block"
              style={{ animationDelay: `${0.35 + i * 0.05}s` }}
            >
              {letter}
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
