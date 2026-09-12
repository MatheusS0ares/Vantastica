// O servidor (Vercel) roda em UTC, mas o produto é 100% Brasil. Sem
// isso, horários de check-in e o corte "hoje" ficam errados perto da
// meia-noite e sempre 3h adiantados na exibição.
const TIMEZONE = "America/Sao_Paulo";
const OFFSET = "-03:00"; // Brasil não observa mais horário de verão

export function todayStartInBrazil(): Date {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${todayStr}T00:00:00${OFFSET}`);
}

export function formatTimeInBrazil(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
}
