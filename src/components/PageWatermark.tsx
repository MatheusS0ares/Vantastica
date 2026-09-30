// Marca d'água sutil da foto da van no fundo da tela inteira, por trás
// do conteúdo (que continua opaco nos próprios cards, então a leitura
// não é afetada). Complementa o VanHeroBanner — aquele é o card de
// destaque no topo, este é só uma textura de fundo mais discreta.
export function PageWatermark({
  photoUrl,
  children,
}: {
  photoUrl?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col">
      {photoUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: `url(${photoUrl})` }}
        />
      )}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
