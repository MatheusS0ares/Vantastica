import Link from "next/link";
import { createStudent } from "../actions";

export default async function NovoAlunoPage({
  searchParams,
}: PageProps<"/motorista/alunos/novo">) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <div className="flex items-center gap-3">
        <Link href="/motorista/alunos" className="text-sm text-muted">
          ← Alunos
        </Link>
      </div>

      <h1 className="font-heading text-xl font-bold text-navy">Novo Aluno</h1>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      <form action={createStudent} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Nome completo
          <input
            type="text"
            name="fullName"
            required
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Foto do aluno
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none file:mr-3 file:rounded-pill file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Escola
          <input
            type="text"
            name="schoolName"
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Turma
          <input
            type="text"
            name="className"
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Endereço de coleta
          <input
            type="text"
            name="pickupAddress"
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Endereço de entrega
          <input
            type="text"
            name="dropoffAddress"
            placeholder="Deixe em branco se for a mesma escola"
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          Restrições médicas / observações
          <textarea
            name="medicalNotes"
            rows={3}
            className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-pill bg-navy px-6 py-3 font-medium text-white shadow-card transition hover:opacity-90"
        >
          Salvar aluno
        </button>
      </form>
    </div>
  );
}
