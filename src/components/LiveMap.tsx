"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { VehicleLocation } from "@/lib/supabase/location";

const POLL_INTERVAL_MS = 12000;
const STALE_AFTER_MS = 5 * 60 * 1000;

function formatRelativeTime(iso: string): string {
  const seconds = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (seconds < 60) return `há ${seconds}s`;
  return `há ${Math.round(seconds / 60)}min`;
}

export function LiveMap({
  organizationId,
  getLocation,
}: {
  organizationId: string;
  getLocation: (organizationId: string) => Promise<VehicleLocation | null>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [location, setLocation] = useState<VehicleLocation | null>(null);
  // Calculado dentro do polling (efeito), não durante o render — Date.now()
  // é impuro e o React proíbe chamar isso direto no corpo do componente.
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const loc = await getLocation(organizationId);
      if (cancelled) return;
      setLocation(loc);
      setIsStale(
        loc !== null &&
          Date.now() - new Date(loc.updatedAt).getTime() > STALE_AFTER_MS,
      );
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [organizationId, getLocation]);

  useEffect(() => {
    if (!location || isStale || !containerRef.current) return;

    let disposed = false;

    import("leaflet").then((leafletModule) => {
      if (disposed) return;
      const L = leafletModule.default;

      // Ícones do Leaflet dependem de paths relativos ao CSS do pacote,
      // que quebram quando tudo passa pelo bundler — apontando direto
      // pros arquivos copiados em public/leaflet evita depender de CDN
      // externo só pra mostrar o pino no mapa.
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      if (!mapRef.current && containerRef.current) {
        mapRef.current = L.map(containerRef.current).setView(
          [location.latitude, location.longitude],
          15,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(mapRef.current);
      } else if (mapRef.current) {
        mapRef.current.setView([location.latitude, location.longitude]);
      }

      if (!mapRef.current) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([location.latitude, location.longitude]);
      } else {
        markerRef.current = L.marker([
          location.latitude,
          location.longitude,
        ]).addTo(mapRef.current);
      }
    });

    return () => {
      disposed = true;
    };
  }, [location, isStale]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  if (!location || isStale) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-card bg-surface p-4 text-center shadow-card">
        <span className="text-sm text-muted">
          Sem localização em tempo real no momento.
        </span>
        <span className="text-xs text-muted">
          Aparece aqui quando o motorista ativar o compartilhamento.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="h-48 w-full overflow-hidden rounded-card shadow-card"
      />
      <span className="text-center text-xs text-muted">
        Atualizado {formatRelativeTime(location.updatedAt)}
      </span>
    </div>
  );
}
