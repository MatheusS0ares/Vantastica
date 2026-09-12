import { Resend } from "resend";

type CheckinEvent = "embarque" | "entrega" | "ausente";

const EVENT_COPY: Record<CheckinEvent, { subject: string; body: string }> = {
  embarque: {
    subject: "embarcou na van",
    body: "acabou de embarcar na van e está a caminho.",
  },
  entrega: {
    subject: "chegou com segurança",
    body: "foi entregue com segurança.",
  },
  ausente: {
    subject: "está ausente hoje",
    body: "não embarcou na van hoje.",
  },
};

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
}: {
  studentName: string;
  eventType: CheckinEvent;
  occurredAt: Date;
  guardianEmails: string[];
}) {
  if (!process.env.RESEND_API_KEY || guardianEmails.length === 0) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const copy = EVENT_COPY[eventType];
  const time = occurredAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    await resend.emails.send({
      from: "VemVan <onboarding@resend.dev>",
      to: guardianEmails,
      subject: `${studentName} ${copy.subject}`,
      html: `<p><strong>${studentName}</strong> ${copy.body}</p><p>Horário: ${time}</p>`,
    });
  } catch (err) {
    console.error("Falha ao enviar notificação de check-in:", err);
  }
}
