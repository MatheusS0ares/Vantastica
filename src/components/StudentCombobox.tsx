"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

type Student = { id: string; full_name: string };

/**
 * Combobox com busca pra escolher um aluno num formulário — troca o
 * <select> simples pelo mesmo padrão de "Combobox" do shadcn/ui
 * (Popover + cmdk). Escreve a escolha num input escondido, então
 * continua funcionando com a Server Action existente sem mudar nada
 * nela (ela só lê formData.get("studentId") como sempre leu).
 */
export function StudentCombobox({
  students,
  name,
  placeholder = "Selecione um aluno...",
}: {
  students: Student[];
  name: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const selected = students.find((s) => s.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={selectedId} />
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-input border border-border bg-surface px-3 py-2 text-left text-base outline-none focus:border-blue"
        >
          <span className={selected ? "text-text" : "text-muted"}>
            {selected?.full_name ?? placeholder}
          </span>
          <span className="text-muted">⌄</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar aluno..." />
          <CommandList>
            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
            {students.map((student) => (
              <CommandItem
                key={student.id}
                value={student.full_name}
                onSelect={() => {
                  setSelectedId(student.id);
                  setOpen(false);
                }}
              >
                {student.full_name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
