import { Resend } from "resend";
import { formatDateInBrazil, formatTimeInBrazil } from "@/lib/timezone";

type CheckinEvent = "embarque" | "entrega" | "ausente";

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

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#F7FAFC;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7FAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="background-color:#FFFFFF;padding:28px 24px;border-bottom:1px solid #E2E8F0;">
                <img src="${logoUrl}" alt="${organizationName}" height="44" style="height:44px;max-width:220px;object-fit:contain;" />
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
                        <strong>${studentName}</strong> ${copy.body}
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
                  ${studentName} na ${organizationName}, via VanTástica.
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
