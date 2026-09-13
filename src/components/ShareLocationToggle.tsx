"use client";

import { useEffect, useRef, useState } from "react";
import { updateVehicleLocation } from "@/app/motorista/rota/actions";

// Não manda toda atualização do GPS pro servidor — watchPosition pode
// disparar bem mais rápido que isso, o que gastaria bateria/dados à
// toa sem melhorar a precisão que o responsável realmente precisa ver.
const MIN_PING_INTERVAL_MS = 12000;

export function ShareLocationToggle() {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function start() {
    if (!("geolocation" in navigator)) {
      setError("Geolocalização não é suportada nesse navegador.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSentAtRef.current < MIN_PING_INTERVAL_MS) return;
        lastSentAtRef.current = now;
        updateVehicleLocation(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        setError(
          "Não foi possível acessar sua localização. Verifique a permissão do navegador.",
        );
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    watchIdRef.current = id;
    setSharing(true);
    setError(null);
  }

  function stop() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }

  return (
    <div className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-navy">
          Localização ao vivo
        </span>
        <button
          type="button"
          onClick={sharing ? stop : start}
          className={`rounded-pill px-4 py-2 text-sm font-semibold transition ${
            sharing
              ? "border border-coral text-coral"
              : "bg-mint text-white hover:opacity-90"
          }`}
        >
          {sharing ? "Parar" : "Compartilhar"}
        </button>
      </div>
      {sharing && (
        <span className="text-xs text-mint">
          Localização sendo enviada — os responsáveis já veem a van no mapa.
        </span>
      )}
      {error && <span className="text-xs text-coral">{error}</span>}
    </div>
  );
}
