import { Resend } from "resend";
import { formatDateInBrazil, formatTimeInBrazil } from "@/lib/timezone";

type CheckinEvent = "embarque" | "entrega" | "ausente";

// studentName e organizationName vêm de texto livre cadastrado pelo
// motorista — sem escapar, um nome com "<" ou """ quebraria o HTML do
// e-mail ou, pior, injetaria uma tag/atributo (ex.: um link falso) no
// que o responsável recebe.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Sem domínio verificado no Resend, o remetente é obrigatoriamente
// onboarding@resend.dev — assim que um domínio próprio for verificado,
// troca só a env var RESEND_FROM_EMAIL (ex.: "VanTástica <noreply@vantastica.com.br>"),
// sem precisar mexer em código.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "VanTástica <onboarding@resend.dev>";

// Assume que o projeto na Vercel também foi renomeado pra "vantastica"
// (Settings → General → Project Name) — se o domínio final for outro,
// configure NEXT_PUBLIC_SITE_URL na Vercel em vez de mudar aqui.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vantastica.vercel.app";
const DEFAULT_LOGO_URL = `${SITE_URL}/logo.png`;

// Opcional: recebe uma cópia oculta de todo e-mail de check-in — útil
// pra confirmar que o envio está saindo de verdade, sem aparecer pros
// responsáveis que também receberam. Configurar em RESEND_BCC_EMAIL na
// Vercel; sem essa env var, ninguém entra em cópia.
const BCC_EMAIL = process.env.RESEND_BCC_EMAIL || undefined;

const EVENT_COPY: Record<
  CheckinEvent,
  { title: string; body: string; color: string; bg: string }
> = {
  embarque: {
    title: "Embarcou na van",
    body: "está a caminho, com segurança.",
    color: "#DD6B20",
    bg: "#FFF7ED",
  },
  entrega: {
    title: "Chegou com segurança",
    body: "foi entregue no destino.",
    color: "#2F855A",
    bg: "#E6FFFA",
  },
  ausente: {
    title: "Ausente hoje",
    body: "não embarcou na van hoje.",
    color: "#C53030",
    bg: "#FFF5F5",
  },
};

// E-mail em tabelas com estilo inline — a única abordagem que renderiza
// de forma confiável no Gmail, Outlook e afins, que ignoram boa parte
// de CSS moderno (flexbox, grid, até <style> em alguns casos).
export function buildCheckinEmailHtml({
  studentName,
  eventType,
  time,
  dateLabel,
  organizationName,
  logoUrl,
}: {
  studentName: string;
  eventType: CheckinEvent;
  time: string;
  dateLabel: string;
  organizationName: string;
  logoUrl: string;
}) {
  const copy = EVENT_COPY[eventType];
  const safeStudentName = escapeHtml(studentName);
  const safeOrganizationName = escapeHtml(organizationName);
  const safeLogoUrl = escapeHtml(logoUrl);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#F7FAFC;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7FAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="background-color:#FFFFFF;padding:28px 24px;border-bottom:1px solid #E2E8F0;">
                <img src="${safeLogoUrl}" alt="${safeOrganizationName}" height="44" style="height:44px;max-width:220px;object-fit:contain;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${copy.bg};border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;color:${copy.color};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                        ${copy.title}
                      </p>
                      <p style="margin:8px 0 0;color:#2D3748;font-size:17px;line-height:1.5;">
                        <strong>${safeStudentName}</strong> ${copy.body}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 0;">
                <p style="margin:0;color:#718096;font-size:14px;">
                  ${dateLabel} às <strong style="color:#2D3748;">${time}</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 32px;">
                <a
                  href="${SITE_URL}/responsavel"
                  style="display:inline-block;background-color:#1A365D;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:9999px;"
                >
                  Ver no app
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background-color:#F7FAFC;border-top:1px solid #E2E8F0;">
                <p style="margin:0;color:#A0AEC0;font-size:12px;line-height:1.6;">
                  Você recebeu este e-mail porque é responsável por
                  ${safeStudentName} na ${safeOrganizationName}, via VanTástica.
                  Notificação automática — não é preciso responder.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildCheckinEmailText({
  studentName,
  eventType,
  time,
  dateLabel,
  organizationName,
}: {
  studentName: string;
  eventType: CheckinEvent;
  time: string;
  dateLabel: string;
  organizationName: string;
}) {
  const copy = EVENT_COPY[eventType];
  return `${copy.title}: ${studentName} ${copy.body}\n${dateLabel} às ${time}\n\n${organizationName} · VanTástica`;
}

function buildGuardianWelcomeEmailHtml({
  studentName,
  organizationName,
  logoUrl,
  loginEmail,
  password,
}: {
  studentName: string;
  organizationName: string;
  logoUrl: string;
  loginEmail: string;
  password: string;
}) {
  const safeStudentName = escapeHtml(studentName);
  const safeOrganizationName = escapeHtml(organizationName);
  const safeLogoUrl = escapeHtml(logoUrl);
  const safeLoginEmail = escapeHtml(loginEmail);
  const safePassword = escapeHtml(password);

  const features = [
    "Acompanhar a van no mapa, em tempo real",
    "Receber um aviso na hora do embarque, da entrega e de faltas",
    "Ver mensalidades e a chave Pix pra pagamento",
  ];

  const featuresHtml = features
    .map(
      (feature) => `
                  <tr>
                    <td style="padding:4px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="top" style="padding-right:8px;color:#2F855A;font-size:14px;font-weight:700;">✓</td>
                          <td style="color:#4A5568;font-size:14px;line-height:1.5;">${escapeHtml(feature)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#F7FAFC;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7FAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="background-color:#1A365D;padding:32px 24px;">
                <img src="${safeLogoUrl}" alt="${safeOrganizationName}" height="40" style="height:40px;max-width:200px;object-fit:contain;" />
                <p style="margin:16px 0 0;color:#FFFFFF;font-size:19px;font-weight:700;">
                  Bem-vindo(a) ao VanTástica!
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 4px;">
                <p style="margin:0;color:#2D3748;font-size:16px;line-height:1.6;">
                  Você foi cadastrado(a) como responsável por
                  <strong>${safeStudentName}</strong> na
                  <strong>${safeOrganizationName}</strong>. O VanTástica é
                  o app que a van usa pra avisar sobre o transporte
                  escolar — e a partir de agora, você acompanha tudo por
                  aqui.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 4px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${featuresHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7FAFC;border-radius:12px;border:1px solid #E2E8F0;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 10px;color:#1A365D;font-size:13px;font-weight:700;">
                        🔑 Seu acesso
                      </p>
                      <p style="margin:0;color:#718096;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                        E-mail
                      </p>
                      <p style="margin:2px 0 10px;color:#2D3748;font-size:16px;">
                        ${safeLoginEmail}
                      </p>
                      <p style="margin:0;color:#718096;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                        Senha inicial
                      </p>
                      <p style="margin:2px 0 0;color:#2D3748;font-size:16px;font-family:monospace;">
                        ${safePassword}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 0;">
                <p style="margin:0;color:#718096;font-size:13px;line-height:1.5;">
                  No primeiro acesso, o app vai pedir pra você trocar essa
                  senha por uma só sua.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 28px 32px;">
                <a
                  href="${SITE_URL}/login"
                  style="display:inline-block;background-color:#1A365D;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:9999px;"
                >
                  Entrar no VanTástica
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background-color:#F7FAFC;border-top:1px solid #E2E8F0;">
                <p style="margin:0;color:#A0AEC0;font-size:12px;line-height:1.6;">
                  Você recebeu este e-mail porque foi cadastrado(a) como
                  responsável por ${safeStudentName} na
                  ${safeOrganizationName}, via VanTástica.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildGuardianWelcomeEmailText({
  studentName,
  organizationName,
  loginEmail,
  password,
}: {
  studentName: string;
  organizationName: string;
  loginEmail: string;
  password: string;
}) {
  return `Bem-vindo(a) ao VanTástica!

Você foi cadastrado(a) como responsável por ${studentName} na ${organizationName}. O VanTástica é o app que a van usa pra avisar sobre o transporte escolar — a partir de agora, você acompanha por aqui:

- A van no mapa, em tempo real
- Aviso na hora do embarque, da entrega e de faltas
- Mensalidades e a chave Pix pra pagamento

Seu acesso:
E-mail: ${loginEmail}
Senha inicial: ${password}

No primeiro acesso o app vai pedir pra trocar essa senha.

Entrar: ${SITE_URL}/login`;
}

/**
 * Avisa o responsável recém-cadastrado do próprio acesso (e-mail + senha
 * inicial), já que a conta agora é criada direto pelo motorista em vez
 * de por link de convite. Falha em silêncio — a conta já foi criada de
 * qualquer forma, e o motorista também vê a senha na tela pra repassar
 * manualmente se o e-mail não chegar.
 */
export async function notifyGuardianOfNewAccount({
  studentName,
  organizationName,
  organizationLogoUrl,
  loginEmail,
  password,
}: {
  studentName: string;
  organizationName: string;
  organizationLogoUrl?: string | null;
  loginEmail: string;
  password: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const logoUrl = organizationLogoUrl || DEFAULT_LOGO_URL;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [loginEmail],
      bcc: BCC_EMAIL,
      subject: `Seu acesso ao VanTástica · ${organizationName}`,
      html: buildGuardianWelcomeEmailHtml({
        studentName,
        organizationName,
        logoUrl,
        loginEmail,
        password,
      }),
      text: buildGuardianWelcomeEmailText({
        studentName,
        organizationName,
        loginEmail,
        password,
      }),
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de boas-vindas ao responsável:", err);
  }
}

/**
 * Notifica por e-mail os responsáveis já vinculados (guardians.email só
 * existe depois que a pessoa reivindica o convite). Falha em silêncio —
 * um problema no envio nunca deve impedir o check-in de ser registrado.
 */
export async function notifyGuardiansOfCheckin({
  studentName,
  eventType,
  occurredAt,
  guardianEmails,
  organizationName,
  organizationLogoUrl,
}: {
  studentName: string;
  eventType: CheckinEvent;
  occurredAt: Date;
  guardianEmails: string[];
  organizationName: string;
  organizationLogoUrl?: string | null;
}) {
  if (!process.env.RESEND_API_KEY || guardianEmails.length === 0) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const copy = EVENT_COPY[eventType];
  const time = formatTimeInBrazil(occurredAt);
  const dateLabel = formatDateInBrazil(occurredAt);
  const logoUrl = organizationLogoUrl || DEFAULT_LOGO_URL;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: guardianEmails,
      bcc: BCC_EMAIL,
      subject: `${studentName} · ${copy.title}`,
      html: buildCheckinEmailHtml({
        studentName,
        eventType,
        time,
        dateLabel,
        organizationName,
        logoUrl,
      }),
      text: buildCheckinEmailText({
        studentName,
        eventType,
        time,
        dateLabel,
        organizationName,
      }),
    });
  } catch (err) {
    console.error("Falha ao enviar notificação de check-in:", err);
  }
}
