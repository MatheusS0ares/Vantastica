// O servidor (Vercel) roda em UTC, mas o produto é 100% Brasil. Sem
// isso, horários de check-in e o corte "hoje" ficam errados perto da
// meia-noite e sempre 3h adiantados na exibição.
const TIMEZONE = "America/Sao_Paulo";
const OFFSET = "-03:00"; // Brasil não observa mais horário de verão

export function dateKeyInBrazil(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayStartInBrazil(): Date {
  return new Date(`${dateKeyInBrazil(new Date())}T00:00:00${OFFSET}`);
}

export function formatTimeInBrazil(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
}

export function formatDateInBrazil(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: TIMEZONE,
  });
}

// Converte "HH:MM" ou "HH:MM:SS" (formato de check-in ou da coluna
// `time` do Postgres) em minutos desde a meia-noite, pra comparar
// horário previsto x horário real de busca/entrega.
export function timeStringToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}
