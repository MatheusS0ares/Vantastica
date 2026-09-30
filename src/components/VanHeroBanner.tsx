// Fundo com a foto real da van (organizations.van_photo_url) — dá mais
// credibilidade pro responsável/motorista ver o veículo de verdade, não
// só um ícone. Cada organização só recebe a própria foto (buscada
// sempre filtrando pela organization_id de quem está vendo a tela),
// então nunca mistura entre vans diferentes. Some sozinho se a
// organização ainda não tiver foto cadastrada.
export function VanHeroBanner({
  vanPhotoUrl,
  organizationName,
}: {
  vanPhotoUrl?: string | null;
  organizationName?: string | null;
}) {
  if (!vanPhotoUrl) return null;

  return (
    <div
      className="relative h-32 overflow-hidden rounded-card bg-cover bg-center shadow-card"
      style={{ backgroundImage: `url(${vanPhotoUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
      {organizationName && (
        <span className="absolute bottom-3 left-4 font-heading text-sm font-semibold text-white drop-shadow">
          {organizationName}
        </span>
      )}
    </div>
  );
}
