import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras de uso da plataforma VanTástica.",
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

export default function TermsOfUsePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-medium text-blue">
          ← Voltar pro início
        </Link>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Termos de Uso
        </h1>
        <p className="text-xs text-muted">Última atualização: {UPDATED_AT}</p>
      </div>

      <div className="flex flex-col gap-8 rounded-card bg-surface p-6 shadow-card">
        <p className="text-sm leading-relaxed text-text">
          Ao criar uma conta ou usar o VanTástica, você concorda com estes
          termos. Leia com atenção — se tiver dúvidas, fale com a gente antes
          de continuar usando a plataforma.
        </p>

        <Section title="1. O que é o VanTástica">
          <p>
            O VanTástica é uma plataforma de gestão para motoristas de van
            escolar, que permite cadastrar alunos e responsáveis, registrar
            check-ins de embarque/entrega, compartilhar localização em tempo
            real e organizar o controle financeiro das mensalidades.
          </p>
        </Section>

        <Section title="2. Quem pode usar">
          <p>
            <strong className="text-navy">Motoristas/organizações:</strong>{" "}
            pessoas responsáveis pela operação de uma van escolar, que criam
            e administram a conta da organização.
          </p>
          <p>
            <strong className="text-navy">Responsáveis:</strong> pais ou
            responsáveis legais de alunos, que se vinculam a uma organização
            por meio de um convite enviado pelo motorista.
          </p>
        </Section>

        <Section title="3. Cadastro e segurança da conta">
          <p>
            Você é responsável por manter sua senha em sigilo e por todas as
            atividades realizadas na sua conta. Avise imediatamente caso
            suspeite de acesso não autorizado.
          </p>
        </Section>

        <Section title="4. Responsabilidades do motorista">
          <p>
            O motorista é responsável pela veracidade dos dados cadastrados
            (alunos, horários, localização, valores de mensalidade) e por
            obter o consentimento dos responsáveis antes de cadastrar dados
            de um aluno na plataforma. O VanTástica é uma ferramenta de
            gestão e comunicação — a prestação do serviço de transporte
            escolar em si é de responsabilidade exclusiva do motorista/
            organização, incluindo qualquer obrigação legal ou regulatória
            aplicável ao transporte escolar em seu município.
          </p>
        </Section>

        <Section title="5. Responsabilidades do responsável">
          <p>
            O responsável deve manter seus dados de contato atualizados para
            receber as notificações de embarque e entrega, e usar as
            informações da plataforma (como localização em tempo real)
            apenas para acompanhar o transporte do seu próprio dependente.
          </p>
        </Section>

        <Section title="6. Pagamentos e mensalidades">
          <p>
            O VanTástica não processa pagamentos. A chave Pix exibida é
            informada pelo próprio motorista, e qualquer cobrança ou acordo
            de mensalidade é feito diretamente entre motorista e responsável,
            fora da plataforma. O VanTástica não se responsabiliza por
            disputas financeiras entre as partes.
          </p>
        </Section>

        <Section title="7. Localização em tempo real">
          <p>
            O compartilhamento de localização é controlado pelo motorista e
            depende de conexão e permissões do dispositivo. O VanTástica não
            garante disponibilidade contínua ou precisão absoluta da
            localização exibida.
          </p>
        </Section>

        <Section title="8. Uso aceitável">
          <p>
            Não é permitido usar a plataforma para cadastrar dados de
            pessoas sem autorização, tentar acessar contas de outras
            organizações, ou usar o serviço para fins ilegais.
          </p>
        </Section>

        <Section title="9. Propriedade intelectual">
          <p>
            A marca VanTástica, o layout e o código da plataforma pertencem
            aos seus desenvolvedores. Os dados que você cadastra continuam
            sendo seus — o VanTástica os trata apenas para prestar o serviço.
          </p>
        </Section>

        <Section title="10. Disponibilidade e limitação de responsabilidade">
          <p>
            O VanTástica é oferecido &quot;como está&quot;. Fazemos o
            possível para manter o serviço disponível e seguro, mas não
            garantimos operação livre de falhas, interrupções ou erros. Na
            máxima extensão permitida por lei, não nos responsabilizamos por
            danos indiretos decorrentes do uso ou da indisponibilidade da
            plataforma.
          </p>
        </Section>

        <Section title="11. Encerramento de conta">
          <p>
            Você pode encerrar sua conta a qualquer momento entrando em
            contato conosco. Podemos suspender ou encerrar contas que violem
            estes termos.
          </p>
        </Section>

        <Section title="12. Alterações nestes termos">
          <p>
            Podemos atualizar estes termos periodicamente. Mudanças
            relevantes serão comunicadas na plataforma antes de entrarem em
            vigor.
          </p>
        </Section>

        <Section title="13. Lei aplicável">
          <p>
            Estes termos são regidos pelas leis da República Federativa do
            Brasil. Veja também nossa{" "}
            <Link href="/privacidade" className="font-medium text-blue">
              Política de Privacidade
            </Link>
            .
          </p>
        </Section>

        <Section title="14. Contato">
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{" "}
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
