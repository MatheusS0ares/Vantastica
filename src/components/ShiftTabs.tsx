"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SHIFTS, SHIFT_LABEL, type Shift } from "@/lib/shifts";

/**
 * A troca de turno é navegação de verdade (o servidor busca dados
 * diferentes pra cada turno), não uma alternância de conteúdo já
 * carregado — por isso cada aba continua sendo um <Link> por baixo. O
 * Tabs do Radix aqui só empresta a navegação por teclado (setas
 * esquerda/direita) e o estado ativo/inativo; quem muda a página
 * continua sendo o próprio link.
 */
export function ShiftTabs({
  selectedShift,
  basePath,
}: {
  selectedShift: Shift;
  basePath: string;
}) {
  return (
    <Tabs value={selectedShift} onValueChange={() => {}}>
      <TabsList>
        {SHIFTS.map((shift) => (
          <TabsTrigger key={shift} value={shift}>
            <Link href={`${basePath}?turno=${shift}`}>
              {SHIFT_LABEL[shift]}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
