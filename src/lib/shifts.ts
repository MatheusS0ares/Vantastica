import { formatTimeInBrazil } from "./timezone";

export const SHIFTS = ["matutino", "vespertino", "noturno"] as const;

export type Shift = (typeof SHIFTS)[number];

export const SHIFT_LABEL: Record<Shift, string> = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  noturno: "Noturno",
};

export function isShift(value: string): value is Shift {
  return (SHIFTS as readonly string[]).includes(value);
}

// Turno sugerido com base na hora atual em Brasília, pra já abrir a Rota
// de Hoje na aba certa (ex.: driver abre o app às 7h, cai direto em
// "Matutino" em vez de precisar escolher).
export function currentShift(): Shift {
  const hour = Number(formatTimeInBrazil(new Date()).split(":")[0]);
  if (hour < 12) return "matutino";
  if (hour < 18) return "vespertino";
  return "noturno";
}
