"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@/components/icons";

/**
 * Mesmo padrão de "input escondido + gatilho estilizado" do
 * StudentCombobox, mas pra data — troca o <input type="date"> nativo
 * (calendário do sistema operacional, inconsistente entre navegadores)
 * por um calendário visual próprio, no estilo Date Picker do shadcn/ui.
 */
export function DatePickerField({
  name,
  required,
  placeholder = "Selecione a data",
}: {
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input
        type="hidden"
        name={name}
        value={date ? format(date, "yyyy-MM-dd") : ""}
        required={required}
      />
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-input border border-border bg-surface px-3 py-2 text-left text-base outline-none focus:border-blue"
        >
          <span className={date ? "text-text" : "text-muted"}>
            {date
              ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
              : placeholder}
          </span>
          <CalendarIcon size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
