"use client";

import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";

export function Calendar({
  selected,
  onSelect,
  disabled,
}: {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}) {
  return (
    <DayPicker
      mode="single"
      locale={ptBR}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      showOutsideDays
      className="vt-calendar"
    />
  );
}
