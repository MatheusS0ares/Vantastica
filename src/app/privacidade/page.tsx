import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o VanTástica coleta, usa e protege os dados de motoristas, responsáveis e alunos.",
};

const UPDATED_AT = "20 de setembro de 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-lg font-semibold text-navy">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-text">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-medium text-blue">
          ← Voltar pro início
        </Link>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Política de Privacidade
        </h1>
        <p className="text-xs text-muted">Última atualização: {UPDATED_AT}</p>
      </div>

      <div className="flex flex-col gap-8 rounded-card bg-surface p-6 shadow-card">
        <p className="text-sm leading-relaxed text-text">
          Esta política explica quais dados o VanTástica coleta, para que os
          usa e quais direitos você tem sobre eles, em conformidade com a Lei
          Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Ela se
          aplica a motoristas de van escolar (&quot;organizações&quot;) e aos
          responsáveis pelos alunos transportados.
        </p>

        <Section title="1. Quem trata os seus dados">
          <p>
            O VanTástica é o controlador dos dados cadastrados na plataforma.
            Cada organização (van escolar) é responsável pelas informações
            que cadastra sobre seus próprios alunos e responsáveis, e o
            VanTástica atua também como operador desses dados ao processá-los
            em nome da organização.
          </p>
        </Section>

        <Section title="2. Quais dados coletamos">
          <p>
            <strong className="text-navy">Do motorista/organização:</strong>{" "}
            nome, e-mail, telefone, nome da van/empresa, logo, foto da van e
            chave Pix (quando informada).
          </p>
          <p>
            <strong className="text-navy">Do responsável:</strong> nome,
            e-mail e telefone.
          </p>
          <p>
            <strong className="text-navy">Do aluno:</strong> nome, foto
            (opcional), escola, turno e horários de embarque/entrega. Esses
            são dados de criança ou adolescente, tratados apenas com o
            consentimento do responsável legal, conforme o Art. 14 da LGPD.
          </p>
          <p>
            <strong className="text-navy">Localização em tempo real:</strong>{" "}
            enquanto o motorista compartilha a localização da van, as
            coordenadas de GPS são armazenadas temporariamente para exibir a
            rota aos responsáveis vinculados.
          </p>
        </Section>

        <Section title="3. Para que usamos esses dados">
          <ul className="list-disc space-y-1 pl-5">
            <li>Operar o cadastro de alunos, turmas e turnos;</li>
            <li>
              Registrar e notificar embarque, entrega e ausências por e-mail;
            </li>
            <li>Exibir a localização da van em tempo real aos responsáveis;</li>
            <li>Exibir informações financeiras (mensalidades e Pix);</li>
            <li>Garantir a segurança e evitar uso indevido da plataforma.</li>
          </ul>
          <p>
            O VanTástica não vende, aluga nem compartilha esses dados com
            terceiros para fins de marketing.
          </p>
        </Section>

        <Section title="4. Com quem os dados são compartilhados">
          <p>
            Os dados de um aluno só ficam visíveis para a organização (van)
            responsável por ele e para os responsáveis vinculados a esse
            aluno. Não há acesso cruzado entre organizações diferentes — essa
            separação é garantida por regras de segurança no banco de dados
            (Row Level Security).
          </p>
          <p>
            Usamos fornecedores de infraestrutura para operar o serviço:
            Supabase (banco de dados e armazenamento de arquivos), Vercel
            (hospedagem) e Resend (envio de e-mails transacionais). Esses
            fornecedores processam dados em nosso nome, sob suas próprias
            políticas de segurança.
          </p>
        </Section>

        <Section title="5. Pagamentos">
          <p>
            O VanTástica não processa nem intermedeia pagamentos. Ele apenas
            exibe a chave Pix cadastrada pelo motorista e o controle de
            mensalidades feito manualmente por ele. Nenhum dado de cartão ou
            conta bancária é armazenado pela plataforma.
          </p>
        </Section>

        <Section title="6. Armazenamento e segurança">
          <p>
            Os dados são armazenados em servidores do Supabase, com conexões
            criptografadas (HTTPS/TLS) e controle de acesso por organização.
            Fotos de alunos ficam em um bucket privado, acessível apenas por
            link assinado e temporário.
          </p>
        </Section>

        <Section title="7. Por quanto tempo guardamos os dados">
          <p>
            Mantemos os dados enquanto a conta estiver ativa. Ao encerrar uma
            conta ou excluir um aluno, os dados correspondentes são
            removidos ou anonimizados, exceto quando a lei exigir retenção
            por período maior (por exemplo, registros fiscais).
          </p>
        </Section>

        <Section title="8. Seus direitos">
          <p>
            Conforme o Art. 18 da LGPD, você pode solicitar a qualquer
            momento: confirmação do tratamento, acesso, correção, exclusão,
            portabilidade dos seus dados ou revogação do consentimento dado
            para o tratamento dos dados do seu filho ou dependente. Para
            exercer esses direitos, entre em contato pelo e-mail abaixo.
          </p>
        </Section>

        <Section title="9. Cookies e armazenamento local">
          <p>
            Usamos apenas cookies e armazenamento local essenciais para
            manter sua sessão autenticada. Não usamos cookies de rastreamento
            publicitário.
          </p>
        </Section>

        <Section title="10. Alterações nesta política">
          <p>
            Podemos atualizar esta política para refletir mudanças no
            serviço ou na legislação. Alterações relevantes serão comunicadas
            na plataforma.
          </p>
        </Section>

        <Section title="11. Contato">
          <p>
            Dúvidas sobre privacidade ou solicitações relacionadas aos seus
            dados podem ser enviadas para{" "}
            <a
              href="mailto:contato@vantastica.com.br"
              className="font-medium text-blue"
            >
              contato@vantastica.com.br
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
