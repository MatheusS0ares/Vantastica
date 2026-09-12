export function formatCentsAsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte "450,00" ou "450.00" ou "450" em centavos (45000). */
export function parseBRLToCents(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}
