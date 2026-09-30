"use client";

import { useEffect, useState } from "react";
import { ShareIcon, SmartphoneIcon } from "@/components/icons";

// Nenhum navegador deixa instalar sozinho no clique de um link — isso
// exige um toque explícito do usuário, por design (impede sites de se
// auto-instalarem sem você perceber). O mais perto disso: Android/Chrome
// expõe um evento que a gente escuta pra oferecer um botão de 1 toque;
// no iOS Safari nem esse evento existe, então só dá pra guiar o passo a
// passo manual (Compartilhar → Adicionar à Tela de Início).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "vt-install-prompt-dismissed";

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // Começa null tanto no servidor quanto na primeira renderização no
  // cliente (que precisam bater pra não dar erro de hidratação) — só
  // depois de montado é que dá pra saber se é iOS/já foi dispensado
  // (não existe SSR equivalente pra navigator.userAgent/localStorage),
  // por isso esse setState só acontece dentro do efeito mesmo.
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;

    if (isIos()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- só dá pra saber que é iOS depois de montar no cliente (sem SSR de navigator.userAgent); calcular isso antes quebraria a hidratação.
      setPlatform("ios");
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPlatform("android");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  function dismiss() {
    setPlatform(null);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // sem localStorage, só fecha por essa sessão mesmo
    }
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (!platform) return null;

  return (
    <div className="mx-4 mt-3 flex items-start gap-3 rounded-card bg-navy px-4 py-3 text-white shadow-card">
      <span className="mt-0.5 shrink-0 text-mint">
        <SmartphoneIcon size={20} />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-semibold">Instale o app</span>
        {platform === "android" ? (
          <>
            <p className="text-xs text-white/80">
              Acesse mais rápido, direto da tela de início do celular.
            </p>
            <button
              type="button"
              onClick={handleInstallClick}
              className="mt-1 w-fit rounded-pill bg-white px-4 py-1.5 text-xs font-semibold text-navy"
            >
              Instalar agora
            </button>
          </>
        ) : (
          <p className="text-xs text-white/80">
            Toque em <ShareIcon size={13} /> (Compartilhar) e depois em
            &quot;Adicionar à Tela de Início&quot;.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="shrink-0 text-lg leading-none text-white/60"
      >
        ×
      </button>
    </div>
  );
}
